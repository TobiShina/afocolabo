// components/TraderSheet.js
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
import { Ionicons } from "@expo/vector-icons";

// Initial structure for a new expense item
const initialExpense = (label) => ({ label: label, amount: 0 });

const TraderSheet = () => {
  const { currentSheet, updateCurrentSheet, saveSheet, currency } = useApp();
  const [localSheet, setLocalSheet] = useState(
    currentSheet || {
      type: "trader",
      date: new Date().toISOString(),
      products: [],
      otherExpenses: [
        initialExpense("Light Bills"),
        initialExpense("Staff Wages"),
      ],
    }
  );

  // Sync local state with global state on mount/change
  useEffect(() => {
    // Use a defensive check to load sheet or initialize if null/wrong type
    if (!currentSheet || currentSheet.type !== "trader") {
      setLocalSheet({
        type: "trader",
        date: new Date().toISOString(),
        products: [],
        otherExpenses: [
          initialExpense("Light Bills"),
          initialExpense("Staff Wages"),
        ],
      });
    } else {
      setLocalSheet(currentSheet);
    }
  }, [currentSheet]);

  // --- Core Calculations ---
  const calculateTotals = () => {
    // Defensive reading: fall back to empty array if undefined
    const products = localSheet.products || [];
    const expenses = localSheet.otherExpenses || [];

    // 1. Product Expenses: sum(quantity_stock * unitCost)
    const productExpenseTotal = products.reduce(
      (sum, p) =>
        sum + (parseFloat(p.stock) || 0) * (parseFloat(p.unitCost) || 0),
      0
    );

    // 2. Product Sales: sum(quantity_sold * unitSellPrice)
    const productSalesTotal = products.reduce(
      (sum, p) =>
        sum + (parseFloat(p.sold) || 0) * (parseFloat(p.unitSellPrice) || 0),
      0
    );

    // 3. Other Expenses: sum(amount)
    const otherExpenseTotal = expenses.reduce(
      (sum, e) => sum + (parseFloat(e.amount) || 0),
      0
    );

    const totalExpenses = productExpenseTotal + otherExpenseTotal;
    const totalSales = productSalesTotal;
    const profitLoss = totalSales - totalExpenses;

    return { totalExpenses, totalSales, profitLoss };
  };

  const { totalExpenses, totalSales, profitLoss } = calculateTotals();

  // --- Handlers ---
  const handleProductChange = (index, key, value) => {
    const newProducts = [...(localSheet.products || [])];
    const numericValue =
      key !== "name" ? parseFloat(value) || (key === "name" ? "" : 0) : value;
    newProducts[index][key] = numericValue;

    const currentStock = parseFloat(newProducts[index].stock) || 0;
    const currentSold = parseFloat(newProducts[index].sold) || 0;

    // Low Stock Alert Logic
    if (key === "sold" && currentStock > 0 && currentStock - currentSold <= 5) {
      // Threshold of 5
      Alert.alert(
        "⚠️ Low Stock Alert",
        `${newProducts[index].name} is running low! Remaining: ${
          currentStock - currentSold
        }`
      );
    }

    setLocalSheet({ ...localSheet, products: newProducts });
  };

  const handleOtherExpenseChange = (index, key, value) => {
    const newExpenses = [...(localSheet.otherExpenses || [])];
    newExpenses[index][key] = key === "label" ? value : parseFloat(value) || 0;
    setLocalSheet({ ...localSheet, otherExpenses: newExpenses });
  };

  const addProduct = () => {
    const newProduct = {
      name: "",
      stock: 0,
      unitCost: 0,
      sold: 0,
      unitSellPrice: 0,
    };
    setLocalSheet({
      ...localSheet,
      products: [...(localSheet.products || []), newProduct],
    });
  };

  const addOtherExpense = () => {
    const newExpense = initialExpense("");
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
        `You made a **${formattedProfitLoss}** profit.`
      );
    } else if (profitLoss < 0) {
      Alert.alert(
        "Sorry 😔",
        `You made a loss of **${formattedProfitLoss}**. Next time can be better.`
      );
    } else {
      Alert.alert("Break Even", "Your sales exactly matched your expenses.");
    }
  };

  // --- UI Component for Products/Expenses ---
  const ProductInput = ({ product, index }) => {
    const remainingStock =
      (parseFloat(product.stock) || 0) - (parseFloat(product.sold) || 0);
    const costValue =
      (parseFloat(product.stock) || 0) * (parseFloat(product.unitCost) || 0);
    const saleValue =
      (parseFloat(product.sold) || 0) *
      (parseFloat(product.unitSellPrice) || 0);

    return (
      <View style={styles.productCard}>
        {/* Product Name (Full Width) */}
        <Text style={styles.productNameLabel}>Product Name:</Text>
        <TextInput
          style={GlobalStyles.input}
          value={product.name}
          onChangeText={(text) => handleProductChange(index, "name", text)}
          placeholder="e.g., Rice, Smartphone"
        />

        {/* Expenses Side Inputs */}
        <Text style={styles.subsectionHeader}>1. Stock & Cost (EXPENSES):</Text>
        <View style={styles.inputGroup}>
          <TextInput
            style={[GlobalStyles.input, styles.halfInput]}
            value={String(product.stock)}
            onChangeText={(text) => handleProductChange(index, "stock", text)}
            keyboardType="numeric"
            placeholder="Qty Stocked"
          />
          <TextInput
            style={[GlobalStyles.input, styles.halfInput]}
            value={String(product.unitCost)}
            onChangeText={(text) =>
              handleProductChange(index, "unitCost", text)
            }
            keyboardType="numeric"
            placeholder={`${currency} Unit Cost`}
          />
        </View>
        <Text style={styles.valueText}>
          Total Stock Cost: {currency}
          {costValue.toFixed(2)}
        </Text>

        {/* Sales Side Inputs */}
        <Text style={styles.subsectionHeader}>2. Sales (SALES):</Text>
        <View style={styles.inputGroup}>
          <TextInput
            style={[GlobalStyles.input, styles.halfInput]}
            value={String(product.sold)}
            onChangeText={(text) => handleProductChange(index, "sold", text)}
            keyboardType="numeric"
            placeholder="Quantity Sold"
          />
          <TextInput
            style={[GlobalStyles.input, styles.halfInput]}
            value={String(product.unitSellPrice)}
            onChangeText={(text) =>
              handleProductChange(index, "unitSellPrice", text)
            }
            keyboardType="numeric"
            placeholder={`${currency} Selling Price`}
          />
        </View>
        <Text style={styles.valueText}>
          Total Sale Value: {currency}
          {saleValue.toFixed(2)}
        </Text>

        {/* Stock Tracker (Feedback) */}
        <Text
          style={[
            styles.stockTracker,
            remainingStock < 5 && remainingStock > 0 && styles.lowStock,
          ]}
        >
          Remaining Stock: {remainingStock}
        </Text>
      </View>
    );
  };

  const OtherExpenseInput = ({ expense, index }) => (
    <View style={styles.expenseRow}>
      <TextInput
        style={[GlobalStyles.input, styles.expenseLabelInput]}
        value={expense.label}
        onChangeText={(text) => handleOtherExpenseChange(index, "label", text)}
        placeholder="e.g., Light Bill, Utility"
      />
      <TextInput
        style={[GlobalStyles.input, styles.expenseAmountInput]}
        value={String(expense.amount)}
        onChangeText={(text) => handleOtherExpenseChange(index, "amount", text)}
        keyboardType="numeric"
        placeholder={`${currency} Amount`}
      />
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
              Product Stock Acquisition Costs:
            </Text>
            {(localSheet.products || []).map((p, i) => (
              <ProductInput key={`exp-${i}`} product={p} index={i} />
            ))}

            <Button
              title="Add Product to Stock"
              onPress={addProduct}
              color={Colors.PRIMARY_RED}
            />

            {/* Lower Sub-Section: Operational Costs */}
            <View style={styles.lowerSubSection}>
              <Text style={styles.sectionTitle}>
                Operational Costs (Bills, Wages, etc.):
              </Text>
              {(localSheet.otherExpenses || []).map((e, i) => (
                <OtherExpenseInput key={`other-${i}`} expense={e} index={i} />
              ))}
              <Button
                title="Add Other Expense"
                onPress={addOtherExpense}
                color={Colors.PRIMARY_RED}
              />
            </View>

            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>
                TOTAL EXPENSE: {currency}
                {totalExpenses.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* --- Right Side: SALES (Whitish-Green) --- */}
          <View style={[GlobalStyles.panel, GlobalStyles.rightPanel]}>
            <Text style={styles.headerTextGreen}>SALES</Text>

            <Text style={styles.sectionTitle}>Product Sales Revenue:</Text>
            {(localSheet.products || []).map((p, i) => {
              const saleValue =
                (parseFloat(p.sold) || 0) * (parseFloat(p.unitSellPrice) || 0);
              return (
                <View key={`sales-${i}`} style={styles.salesSummaryCard}>
                  <Text style={styles.salesProductName}>
                    Product: {p.name || "N/A"}
                  </Text>
                  <Text style={styles.salesDetails}>
                    **Sold:** {p.sold || 0} units
                  </Text>
                  <Text style={styles.salesValue}>
                    **Revenue:** {currency}
                    {saleValue.toFixed(2)}
                  </Text>
                </View>
              );
            })}

            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>
                TOTAL SALES: {currency}
                {totalSales.toFixed(2)}
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
    fontSize: 15,
    marginTop: 10,
    marginBottom: 8,
  },
  productCard: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: "#f0d0d0", // Slightly darker border for the reddish panel
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  productNameLabel: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  subsectionHeader: {
    fontWeight: "600",
    fontSize: 13,
    marginTop: 5,
    color: "#444",
  },
  inputGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  halfInput: {
    flex: 1,
    marginRight: 5,
    marginLeft: 5,
  },
  valueText: {
    textAlign: "right",
    fontSize: 12,
    marginBottom: 5,
    color: "#666",
  },
  stockTracker: {
    marginTop: 5,
    fontWeight: "bold",
    color: Colors.PRIMARY_GREEN,
  },
  lowStock: {
    color: Colors.PRIMARY_RED,
  },
  lowerSubSection: {
    marginTop: 20,
    borderTopWidth: 1,
    paddingTop: 10,
    borderColor: "#ccc",
  },
  expenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  expenseLabelInput: {
    flex: 2,
    marginRight: 5,
  },
  expenseAmountInput: {
    flex: 1,
  },
  salesSummaryCard: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#d0f0d0", // Slightly darker border for the greenish panel
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  salesProductName: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  salesDetails: {
    fontSize: 12,
    color: "#666",
  },
  salesValue: {
    fontWeight: "bold",
    color: Colors.PRIMARY_GREEN,
    marginTop: 5,
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

export default TraderSheet;
