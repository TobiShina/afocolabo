import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { CommonStyles } from "../../../components/CommonStyles";

/* ---------------------------- Reusable Row ---------------------------- */
const EditableInputRow = ({
  label,
  value,
  onChangeText,
  keyboardType = "default",
}) => {
  return (
    <View style={CommonStyles.editableTextContainer}>
      <Text style={CommonStyles.editableTextLabel}>{label}:</Text>
      <TextInput
        style={CommonStyles.editableTextInput}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </View>
  );
};

export default function ArtisanAccountSheet() {
  const [expenses, setExpenses] = useState([]);
  const [workmanship, setWorkmanship] = useState([]);
  const [sheetTitle, setSheetTitle] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("₦");

  // Init defaults (no backend)
  useEffect(() => {
    setExpenses([
      { id: "logistics", name: "Logistics", amount: "" },
      { id: "phone", name: "Phone Calls", amount: "" },
      { id: "feeding", name: "Feeding", amount: "" },
    ]);
    setWorkmanship([{ id: Date.now().toString(), description: "", amount: "" }]);
    setSheetTitle(`New Artisan Sheet - ${new Date().toLocaleDateString()}`);
  }, []);

  const toNum = (v) => {
    const n = parseFloat(String(v).replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
    };

  const handleExpenseChange = (id, value) => {
    setExpenses((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, amount: value } : exp))
    );
  };

  const addWorkmanshipEntry = () => {
    setWorkmanship((prev) => [
      ...prev,
      { id: Date.now().toString(), description: "", amount: "" },
    ]);
  };

  const handleWorkmanshipChange = (index, field, value) => {
    setWorkmanship((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const calculateTotalExpenses = () =>
    expenses.reduce((sum, exp) => sum + toNum(exp.amount), 0);

  const calculateTotalWorkmanship = () =>
    workmanship.reduce((sum, entry) => sum + toNum(entry.amount), 0);

  const handleCalculate = () => {
    const totalExpenses = calculateTotalExpenses();
    const totalWorkmanship = calculateTotalWorkmanship();
    const difference = totalWorkmanship - totalExpenses;

    let msg = "";
    if (difference > 0) {
      msg = `Congratulations, you made ${currencySymbol}${difference.toFixed(2)} profit! 🎉`;
    } else if (difference < 0) {
      msg = `You made a loss of ${currencySymbol}${Math.abs(difference).toFixed(2)}. 📉`;
    } else {
      msg = "You broke even! No profit, no loss. 📊";
    }
    Alert.alert("Calculation Result", msg);
  };

  const totalExpenses = calculateTotalExpenses();
  const totalWork = calculateTotalWorkmanship();

  return (
    <ScrollView style={CommonStyles.container}>
      <View style={styles.sheetHeader}>
        <TextInput
          style={styles.titleInput}
          value={sheetTitle}
          onChangeText={setSheetTitle}
          placeholder="Enter a title for this sheet"
        />
      </View>

      {/* Currency (simple text input to keep it backend-free) */}
      <View style={styles.inlineRow}>
        <Text style={styles.inlineLabel}>Currency Symbol:</Text>
        <TextInput
          style={styles.inlineInput}
          value={currencySymbol}
          onChangeText={setCurrencySymbol}
          placeholder="₦ / $ / € / £"
          maxLength={2}
        />
      </View>

      <View style={styles.sheetContent}>
        <View style={styles.section}>
          <Text style={CommonStyles.sectionHeader}>EXPENSES</Text>
          {expenses.map((exp) => (
            <EditableInputRow
              key={exp.id}
              label={exp.name}
              value={exp.amount}
              onChangeText={(text) => handleExpenseChange(exp.id, text)}
              keyboardType="numeric"
            />
          ))}
          <Text style={CommonStyles.totalText}>
            Total Expenses: {currencySymbol}
            {totalExpenses.toFixed(2)}
          </Text>
        </View>

        <View style={CommonStyles.thinLine} />

        <View style={styles.section}>
          <Text style={CommonStyles.sectionHeader}>WORKMANSHIP</Text>
          {workmanship.map((entry, index) => (
            <View key={entry.id} style={styles.workmanshipEntry}>
              <EditableInputRow
                label="Work Description"
                value={entry.description}
                onChangeText={(text) =>
                  handleWorkmanshipChange(index, "description", text)
                }
              />
              <EditableInputRow
                label="Amount Received"
                value={entry.amount}
                onChangeText={(text) =>
                  handleWorkmanshipChange(index, "amount", text)
                }
                keyboardType="numeric"
              />
            </View>
          ))}
          <TouchableOpacity style={styles.addMoreButton} onPress={addWorkmanshipEntry}>
            <Text style={styles.addMoreButtonText}>+ Add Work Entry</Text>
          </TouchableOpacity>
          <Text style={CommonStyles.totalText}>
            Total Workmanship: {currencySymbol}
            {totalWork.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity style={CommonStyles.submitButton} onPress={handleCalculate}>
          <Text style={CommonStyles.submitButtonText}>Calculate Profit/Loss</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sheetHeader: {
    marginBottom: 20,
    marginTop: 50,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  sheetContent: {
    paddingBottom: 50,
  },
  section: {
    marginBottom: 20,
  },
  workmanshipEntry: {
    backgroundColor: "#e0ffe0",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#c6ecc6",
  },
  addMoreButton: {
    backgroundColor: "#6c757d",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  addMoreButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  inlineLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  inlineInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 60,
  },
});
