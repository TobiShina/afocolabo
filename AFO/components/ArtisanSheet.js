// components/ArtisanSheet.js
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

// Initial structure for a new expense item
const initialExpense = (label) => ({ label: label, amount: 0 });

// Default set of operational costs for an Artisan
const defaultExpenses = [
  initialExpense("Logistics (Transport)"),
  initialExpense("Phone Calls/Data"),
  initialExpense("Feeding (Daily Lunch)"),
  initialExpense("Tool Repairs/Maintenance"),
  initialExpense("Utility Bills (Shop Rent, Light)"),
];

// Initial structure for a new sheet
const getInitialState = () => ({
  type: "artisan",
  date: new Date().toISOString(),
  workmanshipIncome: 0,
  otherExpenses: defaultExpenses,
});

const ArtisanSheet = () => {
  const { currentSheet, updateCurrentSheet, saveSheet, currency } = useApp();
  const [localSheet, setLocalSheet] = useState(
    currentSheet || getInitialState()
  );

  // Sync local state with global state on mount/change
  useEffect(() => {
    // Ensure the sheet is initialized with default structure if currentSheet is null or wrong type
    if (!currentSheet || currentSheet.type !== "artisan") {
      setLocalSheet(getInitialState());
    } else {
      // Merge existing data with defaults defensively (important for previously saved sheets that might miss new fields)
      setLocalSheet({
        ...getInitialState(),
        ...currentSheet,
        otherExpenses:
          currentSheet.otherExpenses && currentSheet.otherExpenses.length > 0
            ? currentSheet.otherExpenses
            : defaultExpenses,
      });
    }
  }, [currentSheet]);

  // --- Core Calculations ---
  const calculateTotals = () => {
    const totalWorkmanship = parseFloat(localSheet.workmanshipIncome) || 0;

    // Defensive reading: fall back to empty array if undefined
    const expenses = localSheet.otherExpenses || [];

    // 1. Other Expenses: sum(amount)
    const totalExpenses = expenses.reduce(
      (sum, e) => sum + (parseFloat(e.amount) || 0),
      0
    );

    const profitLoss = totalWorkmanship - totalExpenses;

    return { totalExpenses, totalWorkmanship, profitLoss };
  };

  const { totalExpenses, totalWorkmanship, profitLoss } = calculateTotals();

  // --- Handlers ---

  const handleIncomeChange = (value) => {
    const numericValue = parseFloat(value) || 0;
    setLocalSheet({ ...localSheet, workmanshipIncome: numericValue });
  };

  const handleExpenseChange = (index, key, value) => {
    // Defensive reading: fall back to empty array if undefined
    const newExpenses = [...(localSheet.otherExpenses || [])];

    // Ensure numeric input for amount
    const numericValue = key === "amount" ? parseFloat(value) || 0 : value;
    newExpenses[index][key] = numericValue;

    setLocalSheet({ ...localSheet, otherExpenses: newExpenses });
  };

  const addOtherExpense = () => {
    const newExpense = initialExpense(""); // Blank expense for user input
    setLocalSheet({
      ...localSheet,
      otherExpenses: [...(localSheet.otherExpenses || []), newExpense],
    });
  };

  const handleSubmitAndSave = () => {
    updateCurrentSheet(localSheet); // Save current state
    saveSheet(localSheet); // Move to saved list

    const formattedProfitLoss = `${currency}${Math.abs(profitLoss).toFixed(2)}`;

    if (profitLoss > 0) {
      Alert.alert(
        "Congratulations! 🥳",
        `You made a **${formattedProfitLoss}** profit from your work!`
      );
    } else if (profitLoss < 0) {
      Alert.alert(
        "Sorry 😔",
        `You made a loss of **${formattedProfitLoss}**. Review your costs.`
      );
    } else {
      Alert.alert(
        "Break Even",
        "Your income exactly matched your operational costs."
      );
    }
  };

  // --- UI Component for Expense Input ---
  const ExpenseInput = ({ expense, index }) => (
    <View style={styles.expenseRow}>
      <TouchableOpacity style={{ flex: 2, marginRight: 5 }}>
        <TextInput
          style={GlobalStyles.input}
          value={expense.label}
          onChangeText={(text) => handleExpenseChange(index, "label", text)}
          placeholder="Expense description"
        />
      </TouchableOpacity>
      <TouchableOpacity style={{ flex: 1 }}>
        <TextInput
          style={GlobalStyles.input}
          value={String(expense.amount)}
          onChangeText={(text) => handleExpenseChange(index, "amount", text)}
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

            <Text style={styles.sectionTitle}>
              Operational Costs (Click to Edit):
            </Text>

            {/* Defensive rendering: use || [] */}
            {(localSheet.otherExpenses || []).map((e, i) => (
              <ExpenseInput key={i} expense={e} index={i} />
            ))}

            <Button
              title="Add Custom Expense"
              onPress={addOtherExpense}
              color={Colors.PRIMARY_RED}
            />

            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>
                TOTAL EXPENSE: {currency}
                {totalExpenses.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* --- Right Side: WORKMANSHIP (Whitish-Green) --- */}
          <View style={[GlobalStyles.panel, GlobalStyles.rightPanel]}>
            <Text style={styles.headerTextGreen}>WORKMANSHIP</Text>

            <Text style={styles.sectionTitle}>Total Income from Services</Text>

            <Text style={{ marginBottom: 5 }}>Income Amount ({currency})</Text>
            <TouchableOpacity>
              <TextInput
                style={GlobalStyles.input}
                value={String(localSheet.workmanshipIncome)}
                onChangeText={handleIncomeChange}
                keyboardType="numeric"
                placeholder="e.g., 500000"
              />
            </TouchableOpacity>
            <Text style={{ fontSize: 12, color: "#666", marginBottom: 20 }}>
              Input the total revenue generated from your artisan work for this
              period.
            </Text>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>
                TOTAL WORKMANSHIP: {currency}
                {totalWorkmanship.toFixed(2)}
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
  summaryBox: {
    marginTop: 30, // Extra space
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: "#ccc",
    // If we use 'auto' margin here, it pushes the box to the bottom of the scroll view panel
    // For simple fixed components, 'auto' is fine, but sticking with a fixed margin is safer for ScrollView content
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

export default ArtisanSheet;
