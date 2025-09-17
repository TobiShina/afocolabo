// getMatches/index.js
const { QueryCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const {
  docClient,
  MATCHES_TABLE,
  apiResponse,
  getCurrentTimeInWAT,
} = require("utils"); // Adjust path

exports.handler = async (event) => {
  // Handle CORS pre-flight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return apiResponse(200, {});
  }

  if (event.httpMethod !== "GET") {
    return apiResponse(405, { message: "Method Not Allowed" });
  }

  const {
    status,
    sport,
    league,
    limit = "100",
  } = event.queryStringParameters || {};
  const parsedLimit = Math.min(parseInt(limit, 10), 200); // Max 200 items for safety

  try {
    let command;
    let items = [];
    let lastEvaluatedKey = null;
    const currentTime = getCurrentTimeInWAT();

    const commonQueryParams = {
      TableName: MATCHES_TABLE,
      Limit: parsedLimit,
      ExpressionAttributeNames: {},
      ExpressionAttributeValues: {},
    };

    if (status) {
      // Use StatusIndex GSI
      commonQueryParams.IndexName = "StatusIndex";
      commonQueryParams.KeyConditionExpression = "#status = :statusVal";
      commonQueryParams.ExpressionAttributeNames["#status"] = "status";
      commonQueryParams.ExpressionAttributeValues[":statusVal"] = status;
      commonQueryParams.ScanIndexForward = true; // Order by sort key (matchDateTime)
    } else if (sport && league) {
      // Use SportLeagueIndex GSI
      commonQueryParams.IndexName = "SportLeagueIndex";
      commonQueryParams.KeyConditionExpression =
        "sport = :sportVal AND league = :leagueVal";
      commonQueryParams.ExpressionAttributeValues[":sportVal"] = sport;
      commonQueryParams.ExpressionAttributeValues[":leagueVal"] = league;
      commonQueryParams.ScanIndexForward = true; // Order by sort key (league) or add another GSI for matchDateTime
    } else {
      // Fallback to Scan (less efficient, use sparingly in production for large tables)
      // or use a default GSI that allows fetching recent/upcoming matches
      console.warn(
        "No specific GSI filters, performing a scan. Consider adding more GSIs or defaulting to a relevant index."
      );
      command = new ScanCommand(commonQueryParams);
      const result = await docClient.send(command);
      items = result.Items;
    }

    if (command) {
      // If it was a ScanCommand
      items = (await docClient.send(command)).Items;
    } else {
      // If it's a QueryCommand (based on GSI)
      do {
        const queryCommand = new QueryCommand({
          ...commonQueryParams,
          ExclusiveStartKey: lastEvaluatedKey,
        });
        const result = await docClient.send(queryCommand);
        items = items.concat(result.Items);
        lastEvaluatedKey = result.LastEvaluatedKey;
      } while (lastEvaluatedKey && items.length < parsedLimit);
    }

    // Filter out matches that have kicked off or are not 'upcoming'/'open'
    const availableMatches = items
      .filter((match) => {
        const matchDateTime = new Date(match.matchDateTime);
        return (
          matchDateTime > currentTime &&
          (match.status === "upcoming" || match.status === "open")
        );
      })
      .map((match) => {
        // Remove sensitive or irrelevant data for public display if any
        const displayMatch = { ...match };
        delete displayMatch.homeScore; // Don't show scores for ongoing/upcoming
        delete displayMatch.awayScore;
        return displayMatch;
      });

    return apiResponse(200, { success: true, matches: availableMatches });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return apiResponse(500, { message: "Failed to retrieve match data." });
  }
};
