// placeBet/index.js
const {
  GetCommand,
  UpdateCommand,
  PutCommand,
  TransactWriteItemsCommand,
} = require("@aws-sdk/lib-dynamodb");
const {
  docClient,
  MIN_STAKE_NAIRA,
  MAX_STAKE_NAIRA,
  MAX_SELECTIONS_PER_TICKET,
  MATCHES_TABLE,
  BETS_TABLE,
  USERS_TABLE,
  apiResponse,
  generateUuid,
  getCurrentTimeInWAT,
} = require("utils"); // Adjust path as needed for your project structure

exports.handler = async (event) => {
  // Handle CORS pre-flight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return apiResponse(200, {});
  }

  if (event.httpMethod !== "POST") {
    return apiResponse(405, { message: "Method Not Allowed" });
  }

  const userId = event.headers["x-user-id"]; // Trusted userId from host
  if (!userId) {
    return apiResponse(400, { message: "X-User-Id header is required." });
  }

  let requestBody;
  try {
    requestBody = JSON.parse(event.body);
  } catch (e) {
    return apiResponse(400, { message: "Invalid JSON in request body." });
  }

  const { selections, stake } = requestBody;

  // --- Input Validation ---
  if (!selections || !Array.isArray(selections) || selections.length === 0) {
    return apiResponse(400, {
      message: "Bet selections are required and must be an array.",
    });
  }
  if (selections.length > MAX_SELECTIONS_PER_TICKET) {
    return apiResponse(400, {
      message: `Maximum of ${MAX_SELECTIONS_PER_TICKET} selections allowed per ticket.`,
    });
  }
  if (
    typeof stake !== "number" ||
    isNaN(stake) ||
    stake < MIN_STAKE_NAIRA ||
    stake > MAX_STAKE_NAIRA
  ) {
    return apiResponse(400, {
      message: `Stake must be between ₦${MIN_STAKE_NAIRA} and ₦${MAX_STAKE_NAIRA}.`,
    });
  }

  try {
    let totalOdds = 1;
    const betDetails = [];
    const matchIdsOnTicket = new Set(); // To track unique match IDs on this ticket

    // Fetch all unique match data efficiently using BatchGetItem if many, or GetCommand for a few
    const uniqueMatchIds = [...new Set(selections.map((s) => s.matchId))];
    if (uniqueMatchIds.length === 0) {
      return apiResponse(400, { message: "No valid match IDs in selections." });
    }

    const getMatchPromises = uniqueMatchIds.map((matchId) =>
      docClient.send(
        new GetCommand({ TableName: MATCHES_TABLE, Key: { matchId } })
      )
    );
    const matchResults = await Promise.all(getMatchPromises);
    const matchDataMap = {};
    matchResults.forEach((res) => {
      if (res.Item) {
        matchDataMap[res.Item.matchId] = res.Item;
      }
    });

    const currentTime = getCurrentTimeInWAT();

    for (const clientSelection of selections) {
      const matchData = matchDataMap[clientSelection.matchId];

      if (!matchData) {
        return apiResponse(404, {
          message: `Match ${clientSelection.matchId} not found.`,
        });
      }

      // Check kickoff time and status
      const matchDateTime = new Date(matchData.matchDateTime);
      if (matchDateTime <= currentTime) {
        return apiResponse(400, {
          message: `Match '${matchData.homeTeam} vs ${matchData.awayTeam}' (${clientSelection.matchId}) has already kicked off.`,
        });
      }
      if (matchData.status !== "upcoming" && matchData.status !== "open") {
        return apiResponse(400, {
          message: `Match '${matchData.homeTeam} vs ${matchData.awayTeam}' (${clientSelection.matchId}) is not open for betting (Status: ${matchData.status}).`,
        });
      }

      const serverOddsForMarket =
        matchData.odds && matchData.odds[clientSelection.market];
      if (!serverOddsForMarket) {
        return apiResponse(400, {
          message: `Market '${clientSelection.market}' not found for match ${clientSelection.matchId}.`,
        });
      }

      const authoritativeOdd = serverOddsForMarket[clientSelection.selection];
      if (typeof authoritativeOdd !== "number" || authoritativeOdd <= 0) {
        return apiResponse(400, {
          message: `Selection '${clientSelection.selection}' or its odd is invalid for market '${clientSelection.market}' in match ${clientSelection.matchId}.`,
        });
      }

      // Use server's authoritative odd for calculation
      if (clientSelection.odd !== authoritativeOdd) {
        console.warn(
          `Client odd (${clientSelection.odd}) for match ${clientSelection.matchId}, market ${clientSelection.market}, selection ${clientSelection.selection} differs from server's (${authoritativeOdd}). Using server's.`
        );
      }

      totalOdds *= authoritativeOdd;
      betDetails.push({ ...clientSelection, odd: authoritativeOdd });
      matchIdsOnTicket.add(clientSelection.matchId); // Add to set for unique list later
    }

    const potentialPayout = stake * totalOdds;
    const betId = `BET-${generateUuid()}`;

    // Ensure user record exists or create it with initial balance if needed
    // For a true plugin, host might ensure user exists or you handle creation here.
    // For simplicity, we'll try to update balance and conditionally create if not exists
    // A more robust system would have a dedicated user creation endpoint on first interaction.
    const userExistsCheck = await docClient.send(
      new GetCommand({ TableName: USERS_TABLE, Key: { userId } })
    );
    if (!userExistsCheck.Item) {
      // User doesn't exist, create with 0 balance for now.
      await docClient.send(
        new PutCommand({
          TableName: USERS_TABLE,
          Item: {
            userId: userId,
            balance: 0,
            createdAt: new Date().toISOString(),
          },
        })
      );
      // Now, user exists, but balance is 0. Bet will fail due to insufficient funds.
      // This is a design choice; you might want to initialize with a starting balance if new.
    }

    // --- DynamoDB Transaction ---
    const transactItems = [
      {
        // Update user balance (decrement)
        Update: {
          TableName: USERS_TABLE,
          Key: { userId: userId },
          UpdateExpression: "SET balance = balance - :stake, lastUpdated = :lu",
          ConditionExpression: "attribute_exists(userId) AND balance >= :stake", // Ensure user exists and has enough funds
          ExpressionAttributeValues: {
            ":stake": stake,
            ":lu": new Date().toISOString(),
          },
        },
      },
      {
        // Create new bet item
        Put: {
          TableName: BETS_TABLE,
          Item: {
            betId: betId,
            userId: userId,
            selections: betDetails,
            stake: stake,
            totalOdds: parseFloat(totalOdds.toFixed(4)), // Store with reasonable precision
            potentialPayout: parseFloat(potentialPayout.toFixed(2)),
            timestamp: new Date().toISOString(),
            status: "pending",
            matchIds: Array.from(matchIdsOnTicket), // Convert Set to Array
            winnings: 0, // Initialize winnings
          },
          ConditionExpression: "attribute_not_exists(betId)", // Prevent overwriting
        },
      },
    ];

    await docClient.send(
      new TransactWriteItemsCommand({ TransactItems: transactItems })
    );

    return apiResponse(200, {
      success: true,
      message: "Bet placed successfully!",
      betId,
    });
  } catch (error) {
    console.error("Error in placeBet Lambda:", error);
    if (error.name === "TransactionCanceledException") {
      // Check specific cancellation reasons for more granular error messages
      const cancellationReasons = error.CancellationReasons;
      if (
        cancellationReasons &&
        cancellationReasons.some((r) => r.Code === "ConditionalCheckFailed")
      ) {
        // This means either 'userId' didn't exist or 'balance' was insufficient
        // Since we created user if not exists, this implies insufficient balance.
        return apiResponse(400, {
          message: "Insufficient balance. Please deposit funds.",
        });
      }
    }
    return apiResponse(500, {
      message:
        "An internal server error occurred while processing your bet. Please try again later.",
    });
  }
};
