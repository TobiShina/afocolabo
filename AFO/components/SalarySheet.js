// components/SalarySheet.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useApp } from "../context/AppContext";
import { GlobalStyles, Colors } from "./SharedStyles";

// Initial structure for a new sheet
const getInitialState = () => ({
  type: "salary",
  date: new Date().toISOString(),
  salaryAmount: 0,
  workDays: 20, // Default to 20 working days
  dailyCosts: {
    transport: 0,
    lunch: 0,
  },
  otherMonthlyExpenses: [
    // Fixed monthly expenses (lower sub-section equivalent)
    { label: "Rent/Mortgage", amount: 0 },
    { label: "Utilities (Electricity, Internet)", amount: 0 },
    { label: "Subscriptions (Streaming, Gym)", amount: 0 },
  ],
});

const SalarySheet = () => {
  const { currentSheet, updateCurrentSheet, saveSheet, currency } = useApp();
  const [localSheet, setLocalSheet] = useState(
    currentSheet || getInitialState()
  );

  // Sync local state with global state on mount/change
  useEffect(() => {
    // Ensure the sheet is initialized with default structure if currentSheet is null or wrong type
    if (!currentSheet || currentSheet.type !== "salary") {
      setLocalSheet(getInitialState());
    } else {
      // Defensive merge to ensure all expected properties are present
      setLocalSheet({
        ...getInitialState(),
        ...currentSheet,
        dailyCosts: {
          ...getInitialState().dailyCosts,
          ...currentSheet.dailyCosts,
        },
        otherMonthlyExpenses:
          currentSheet.otherMonthlyExpenses ||
          getInitialState().otherMonthlyExpenses,
      });
    }
  }, [currentSheet]);

  // --- Core Calculations ---
  const calculateTotals = () => {
    const salaryIncome = parseFloat(localSheet.salaryAmount) || 0;
    const workDays = parseFloat(localSheet.workDays) || 0;

    // Defensive reading for daily costs
    const dailyTransport = parseFloat(localSheet.dailyCosts?.transport) || 0;
    const dailyLunch = parseFloat(localSheet.dailyCosts?.lunch) || 0;

    // Calculation: (Daily Transport + Daily Lunch) * Number of Work Days
    const calculatedDailyCost = (dailyTransport + dailyLunch) * workDays;

    // Defensive reading: fall back to empty array if undefined
    const monthlyExpenses = localSheet.otherMonthlyExpenses || [];

    // Sum of other fixed monthly expenses
    // Defensive usage of reduce
    const otherMonthlyExpenseTotal = monthlyExpenses.reduce(
      (sum, e) => sum + (parseFloat(e.amount) || 0),
      0
    );

    const totalExpenses = calculatedDailyCost + otherMonthlyExpenseTotal;
    const profitLoss = salaryIncome - totalExpenses;

    return {
      totalExpenses,
      calculatedDailyCost,
      otherMonthlyExpenseTotal,
      salaryIncome,
      profitLoss,
    };
  };

  const {
    totalExpenses,
    calculatedDailyCost,
    otherMonthlyExpenseTotal,
    salaryIncome,
    profitLoss,
  } = calculateTotals();

  // --- Handlers ---
  const handleSalaryChange = (value) => {
    const numericValue = parseFloat(value) || 0;
    setLocalSheet({ ...localSheet, salaryAmount: numericValue });
  };

  const handleDailyCostChange = (key, value) => {
    const numericValue = parseFloat(value) || 0;
    setLocalSheet({
      ...localSheet,
      dailyCosts: { ...localSheet.dailyCosts, [key]: numericValue },
    });
  };

  const handleWorkDaysChange = (value) => {
    const numericValue = parseInt(value) || 0;
    setLocalSheet({ ...localSheet, workDays: numericValue });
  };

  const handleMonthlyExpenseChange = (index, key, value) => {
    const newExpenses = [...(localSheet.otherMonthlyExpenses || [])];

    // Ensure numeric input for amount
    const numericValue = key === "amount" ? parseFloat(value) || 0 : value;
    newExpenses[index][key] = numericValue;

    setLocalSheet({ ...localSheet, otherMonthlyExpenses: newExpenses });
  };

  const addOtherMonthlyExpense = () => {
    const newExpense = { label: "", amount: 0 };
    setLocalSheet({
      ...localSheet,
      otherMonthlyExpenses: [
        ...(localSheet.otherMonthlyExpenses || []),
        newExpense,
      ],
    });
  };

  const handleSubmitAndSave = () => {
    updateCurrentSheet(localSheet); // Save current state
    saveSheet(localSheet); // Move to saved list

    const formattedProfitLoss = `${currency}${Math.abs(profitLoss).toFixed(2)}`;

    if (profitLoss > 0) {
      Alert.alert(
        "Congratulations! 🥳",
        `You made a **${formattedProfitLoss}** monthly profit/surplus.`
      );
    } else if (profitLoss < 0) {
      Alert.alert(
        "Warning 😬",
        `You overspent by **${formattedProfitLoss}**. Time to adjust your budget.`
      );
    } else {
      Alert.alert(
        "Break Even",
        "Your income exactly matched your expenditures."
      );
    }
  };

  // --- UI Component for Monthly Expense Input ---
  const MonthlyExpenseInput = ({ expense, index }) => (
    <View style={styles.expenseRow}>
      <TouchableOpacity style={{ flex: 2, marginRight: 5 }}>
        <TextInput
          style={GlobalStyles.input}
          value={expense.label}
          onChangeText={(text) =>
            handleMonthlyExpenseChange(index, "label", text)
          }
          placeholder="Expense name"
        />
      </TouchableOpacity>
      <TouchableOpacity style={{ flex: 1 }}>
        <TextInput
          style={GlobalStyles.input}
          value={String(expense.amount)}
          onChangeText={(text) =>
            handleMonthlyExpenseChange(index, "amount", text)
          }
          keyboardType="numeric"
          placeholder={`${currency} Amount`}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={GlobalStyles.sheetContainer}>
          {/* --- Left Side: EXPENSES (Whitish-Red) --- */}
          <View style={[GlobalStyles.panel, GlobalStyles.leftPanel]}>
            <Text style={styles.headerTextRed}>EXPENSES</Text>

            <Text style={styles.sectionTitle}>Daily Costs Calculation:</Text>

            <Text>Number of Work Days Monthly:</Text>
            <TextInput
              style={GlobalStyles.input}
              value={String(localSheet.workDays)}
              onChangeText={handleWorkDaysChange}
              keyboardType="numeric"
              placeholder="e.g., 20"
            />

            <Text>Daily Transportation Cost ({currency}):</Text>
            <TextInput
              style={GlobalStyles.input}
              value={String(localSheet.dailyCosts?.transport || 0)}
              onChangeText={(text) => handleDailyCostChange("transport", text)}
              keyboardType="numeric"
              placeholder="e.g., 500"
            />

            <Text>Daily Lunch/Feeding Cost ({currency}):</Text>
            <TextInput
              style={GlobalStyles.input}
              value={String(localSheet.dailyCosts?.lunch || 0)}
              onChangeText={(text) => handleDailyCostChange("lunch", text)}
              keyboardType="numeric"
              placeholder="e.g., 1500"
            />

            <Text style={styles.calculatedCostText}>
              Calculated Commuting/Lunch Cost: {currency}
              {calculatedDailyCost.toFixed(2)}
            </Text>

            {/* --- Lower Sub-Section: Other Fixed Expenses --- */}
            <View style={styles.fixedExpenseSection}>
              <Text style={styles.sectionTitle}>
                Other Fixed Monthly Expenses (Lower Sub-Section)
              </Text>
              {/* Defensive rendering: use || [] */}
              {(localSheet.otherMonthlyExpenses || []).map((e, i) => (
                <MonthlyExpenseInput key={i} expense={e} index={i} />
              ))}
              <Button
                title="Add Custom Expense"
                onPress={addOtherMonthlyExpense}
                color={Colors.PRIMARY_RED}
              />
              <Text style={styles.calculatedCostText}>
                Fixed Expenses Total: {currency}
                {otherMonthlyExpenseTotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>
                TOTAL EXPENSE: {currency}
                {totalExpenses.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* --- Right Side: SALARY (Whitish-Green) --- */}
          <View style={[GlobalStyles.panel, GlobalStyles.rightPanel]}>
            <Text style={styles.headerTextGreen}>SALARY</Text>

            <Text style={styles.sectionTitle}>Monthly Net Salary</Text>

            <Text style={{ marginBottom: 5 }}>
              Net Salary Amount ({currency})
            </Text>
            <TouchableOpacity>
              <TextInput
                style={GlobalStyles.input}
                value={String(localSheet.salaryAmount)}
                onChangeText={handleSalaryChange}
                keyboardType="numeric"
                placeholder="e.g., 300000"
              />
            </TouchableOpacity>
            <Text style={{ fontSize: 12, color: "#666", marginBottom: 20 }}>
              Input your total take-home pay for the month.
            </Text>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>
                TOTAL SALARY: {currency}
                {salaryIncome.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* --- Submit/Save Button --- */}
      <View style={styles.submitContainer}>
        <Button
          title="SUBMIT & SAVE ACCOUNT SHEET"
          onPress={handleSubmitAndSave}
          color="#1E90FF"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerTextRed: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.PRIMARY_RED,
    marginBottom: 15,
  },
  headerTextGreen: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.PRIMARY_GREEN,
    marginBottom: 15,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 10,
    marginBottom: 8,
  },
  expenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  calculatedCostText: {
    marginTop: 5,
    marginBottom: 15,
    fontSize: 14,
    fontWeight: "600",
    color: "#4682B4",
  },
  fixedExpenseSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  summaryBox: {
    marginTop: 30, // Extra space
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  summaryText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  submitContainer: {
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
});

export default SalarySheet;
