import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { CommonStyles } from "../../../components/CommonStyles";

/* ---------------------------- Reusable Rows ---------------------------- */
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

const OtherExpenseRow = ({ index, expense, onChangeName, onChangeAmount, onRemove }) => {
  return (
    <View style={styles.otherExpenseRow}>
      <View style={{ flex: 1 }}>
        <EditableInputRow
          label={`Expense ${index + 1} Name`}
          value={expense.name}
          onChangeText={(t) => onChangeName(expense.id, t)}
          keyboardType="default"
        />
      </View>
      <View style={{ flex: 1 }}>
        <EditableInputRow
          label="Amount"
          value={expense.amount}
          onChangeText={(t) => onChangeAmount(expense.id, t)}
          keyboardType="numeric"
        />
      </View>
      <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(expense.id)}>
        <Text style={styles.removeBtnText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
};

/* ---------------------------- Main Screen ---------------------------- */
export default function SalaryAccountSheet() {
  const [loading, setLoading] = useState(true);

  const [salary, setSalary] = useState("");
  const [dailyTransportCost, setDailyTransportCost] = useState("");
  const [dailyLunchCost, setDailyLunchCost] = useState("");
  const [workDaysMonthly, setWorkDaysMonthly] = useState("");
  const [otherExpenses, setOtherExpenses] = useState([]);
  const [sheetTitle, setSheetTitle] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("₦");

  // Initialize defaults (no backend)
  useEffect(() => {
    setOtherExpenses([
      { id: "rent", name: "Rent", amount: "" },
      { id: "subscriptions", name: "Subscriptions", amount: "" },
    ]);
    setSheetTitle(`New Salary Sheet - ${new Date().toLocaleDateString()}`);
    setLoading(false);
  }, []);

  const handleOtherExpenseNameChange = (id, value) => {
    setOtherExpenses((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, name: value } : exp))
    );
  };

  const handleOtherExpenseAmountChange = (id, value) => {
    setOtherExpenses((prev) =>
      prev.map((exp) => (exp.id === id ? { ...exp, amount: value } : exp))
    );
  };

  const removeOtherExpense = (id) => {
    setOtherExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const addOtherExpense = () => {
    setOtherExpenses((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", amount: "" },
    ]);
  };

  const toNum = (v) => {
    const n = parseFloat(String(v).replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  };

  const calculateTotalExpenses = () => {
    const transport = toNum(dailyTransportCost) * toNum(workDaysMonthly);
    const lunch = toNum(dailyLunchCost) * toNum(workDaysMonthly);
    const other = otherExpenses.reduce((sum, exp) => sum + toNum(exp.amount), 0);
    return transport + lunch + other;
  };

  const handleCalculate = () => {
    const totalExpenses = calculateTotalExpenses();
    const totalSalary = toNum(salary);
    const difference = totalSalary - totalExpenses;

    let alertMessage = "";
    if (difference > 0) {
      alertMessage = `Congratulations, you have ${currencySymbol}${difference.toFixed(
        2
      )} remaining after expenses! 🎉`;
    } else if (difference < 0) {
      alertMessage = `Your expenses exceed your salary by ${currencySymbol}${Math.abs(
        difference
      ).toFixed(2)}. Consider reviewing your spending. 📉`;
    } else {
      alertMessage = "You broke even! No extra cash, no deficit. 📊";
    }

    Alert.alert("Monthly Balance", alertMessage);
  };

  if (loading) {
    return (
      <View style={CommonStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  const monthlyDailyExpenses = (toNum(dailyTransportCost) + toNum(dailyLunchCost)) * toNum(workDaysMonthly);

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

      <View style={styles.sheetContent}>
        {/* Currency selector (simple text input to keep it backend-free) */}
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

        <View style={styles.section}>
          <Text style={CommonStyles.sectionHeader}>SALARY</Text>
          <EditableInputRow
            label="Monthly Salary"
            value={salary}
            onChangeText={setSalary}
            keyboardType="numeric"
          />
          <Text style={CommonStyles.totalText}>
            Total Salary: {currencySymbol}
            {toNum(salary).toFixed(2)}
          </Text>
        </View>

        <View style={CommonStyles.thinLine} />

        <View style={styles.section}>
          <Text style={CommonStyles.sectionHeader}>EXPENSES</Text>
          <EditableInputRow
            label="Daily Transportation Cost"
            value={dailyTransportCost}
            onChangeText={setDailyTransportCost}
            keyboardType="numeric"
          />
          <EditableInputRow
            label="Daily Lunch Cost"
            value={dailyLunchCost}
            onChangeText={setDailyLunchCost}
            keyboardType="numeric"
          />
          <EditableInputRow
            label="Work Days Monthly"
            value={workDaysMonthly}
            onChangeText={setWorkDaysMonthly}
            keyboardType="numeric"
          />
          <Text style={styles.calculatedValue}>
            Total Monthly Daily Expenses: {currencySymbol}
            {monthlyDailyExpenses.toFixed(2)}
          </Text>

          <Text style={[styles.subHeader, { marginTop: 20 }]}>
            Other Monthly Expenses:
          </Text>

          {otherExpenses.map((exp, index) => (
            <OtherExpenseRow
              key={exp.id}
              index={index}
              expense={exp}
              onChangeName={handleOtherExpenseNameChange}
              onChangeAmount={handleOtherExpenseAmountChange}
              onRemove={removeOtherExpense}
            />
          ))}

          <TouchableOpacity style={styles.addMoreButton} onPress={addOtherExpense}>
            <Text style={styles.addMoreButtonText}>+ Add Other Expense</Text>
          </TouchableOpacity>

          <Text style={CommonStyles.totalText}>
            Total Expenses: {currencySymbol}
            {calculateTotalExpenses().toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity style={CommonStyles.submitButton} onPress={handleCalculate}>
          <Text style={CommonStyles.submitButtonText}>Calculate Balance</Text>
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
  calculatedValue: {
    fontSize: 15,
    marginTop: 5,
    textAlign: "right",
    fontWeight: "bold",
    color: "#0056b3",
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
  subHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#555",
  },
  otherExpenseRow: {
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 8,
    padding: 6,
  },
  removeBtn: {
    backgroundColor: "#dc3545",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 6,
  },
  removeBtnText: {
    color: "#fff",
    fontWeight: "600",
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
