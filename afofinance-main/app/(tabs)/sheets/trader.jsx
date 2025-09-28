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
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonStyles } from "../../../components/CommonStyles";

/** ============= Local storage helpers (AsyncStorage) ============= */
const LIST_KEY = "traderSheets:list";
const ITEM_KEY = (id) => `traderSheets:item:${id}`;

const readJSON = async (key, fallback) => {
  try {
    const v = await AsyncStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const writeJSON = async (key, value) =>
  AsyncStorage.setItem(key, JSON.stringify(value));
const nowIso = () => new Date().toISOString();
const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function getSheetById(id) {
  return readJSON(ITEM_KEY(id), null);
}
async function upsertSheet(sheet) {
  const ids = (await readJSON(LIST_KEY, [])) ?? [];
  if (!ids.includes(sheet.id)) {
    ids.push(sheet.id);
    await writeJSON(LIST_KEY, ids);
  }
  await writeJSON(ITEM_KEY(sheet.id), sheet);
  return sheet.id;
}
async function createSheet(data) {
  const id = newId();
  const sheet = {
    id,
    title: data.title ?? `Trader Sheet - ${new Date().toLocaleDateString()}`,
    type: "trader",
    products: data.products ?? [],
    generalExpenses: data.generalExpenses ?? [],
    totalSales: data.totalSales ?? 0,
    totalExpenses: data.totalExpenses ?? 0,
    profitOrLoss: data.profitOrLoss ?? 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  await upsertSheet(sheet);
  return id;
}
async function updateSheet(id, patch) {
  const current = (await getSheetById(id)) ?? { id, createdAt: nowIso() };
  const next = { ...current, ...patch, id, updatedAt: nowIso() };
  await upsertSheet(next);
  return id;
}
/** =============================================================== */

// Helper component for editable input rows
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
        value={String(value ?? "")}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </View>
  );
};

export default function TraderAccountSheet() {
  const params = useLocalSearchParams();
  // sheetId can be string | string[] | undefined
  const resolvedSheetId =
    typeof params.sheetId === "string" ? params.sheetId : undefined;

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [generalExpenses, setGeneralExpenses] = useState([]);
  const [sheetTitle, setSheetTitle] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("₦");

  const isExistingSheet = !!resolvedSheetId;

  // Load existing data or set initial state
  useEffect(() => {
    const fetchSheetData = async () => {
      // Load currency symbol preference
      try {
        const storedCurrencyCode = await AsyncStorage.getItem("userCurrency");
        if (storedCurrencyCode) {
          const symbols = { NGN: "₦", USD: "$", EUR: "€", GBP: "£" };
          setCurrencySymbol(symbols[storedCurrencyCode] || "₦");
        }
      } catch (e) {
        console.warn("Failed to load currency from storage", e);
      }

      if (isExistingSheet) {
        const existing = await getSheetById(String(resolvedSheetId));
        if (existing) {
          setProducts(existing.products || []);
          setGeneralExpenses(existing.generalExpenses || []);
          setSheetTitle(existing.title || "");
        } else {
          Alert.alert("Error", "Sheet not found.");
        }
      } else {
        // fresh sheet defaults
        setProducts([
          {
            id: Date.now().toString(),
            name: "",
            costPrice: "",
            sellingPrice: "",
            initialStock: "",
            quantitySold: "",
            lowStockThreshold: "5",
            currentStock: 0,
          },
        ]);
        setGeneralExpenses([
          { id: "light", name: "Light Bills", amount: "" },
          { id: "repairs", name: "Repairs", amount: "" },
          { id: "utility", name: "Utility Bills", amount: "" },
          { id: "wages", name: "Staff Wages", amount: "" },
        ]);
        setSheetTitle(`New Trader Sheet - ${new Date().toLocaleDateString()}`);
      }

      setLoading(false);
    };

    fetchSheetData();
  }, [resolvedSheetId, isExistingSheet]);

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;

    const p = newProducts[index];
    const initialStock = parseFloat(p.initialStock || 0);
    const quantitySold = parseFloat(p.quantitySold || 0);
    const lowStockThreshold = parseFloat(p.lowStockThreshold || 0);

    // recompute current stock whenever relevant fields change
    if (["quantitySold", "initialStock", "lowStockThreshold"].includes(field)) {
      const remainingStock = initialStock - quantitySold;
      newProducts[index].currentStock = remainingStock;

      if (remainingStock < 0) {
        Alert.alert(
          "Stock Error",
          `You are trying to sell more '${p.name || "Product"}' than available.\nCurrent stock: ${initialStock}. Quantity sold: ${quantitySold}.`
        );
      } else if (
        remainingStock <= lowStockThreshold &&
        initialStock > 0 &&
        quantitySold > 0
      ) {
        Alert.alert(
          "Low Stock Alert! 🚨",
          `'${p.name || "Product"}' is now at ${remainingStock} units. Consider reordering soon.`
        );
      }
    }

    setProducts(newProducts);
  };

  const handleGeneralExpenseChange = (id, value) => {
    const newExpenses = generalExpenses.map((exp) =>
      exp.id === id ? { ...exp, amount: value } : exp
    );
    setGeneralExpenses(newExpenses);
  };

  const addProduct = () => {
    setProducts((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: "",
        costPrice: "",
        sellingPrice: "",
        initialStock: "",
        quantitySold: "",
        lowStockThreshold: "5",
        currentStock: 0,
      },
    ]);
  };

  const calculateTotalExpenses = () => {
    const productExpenses = products.reduce((sum, p) => {
      const cost = parseFloat(p.costPrice || 0);
      const qty = parseFloat(p.quantitySold || 0);
      return sum + cost * qty;
    }, 0);

    const generalExp = generalExpenses.reduce((sum, exp) => {
      return sum + parseFloat(exp.amount || 0);
    }, 0);

    return productExpenses + generalExp;
  };

  const calculateTotalSales = () => {
    return products.reduce((sum, p) => {
      const price = parseFloat(p.sellingPrice || 0);
      const qty = parseFloat(p.quantitySold || 0);
      return sum + price * qty;
    }, 0);
  };

  const handleSaveOrSubmit = async () => {
    const totalExpenses = calculateTotalExpenses();
    const totalSales = calculateTotalSales();
    const difference = totalSales - totalExpenses;

    let alertMessage = "";
    if (difference > 0) {
      alertMessage = `Congratulations, you made ${currencySymbol}${difference.toFixed(
        2
      )} profit! 🎉`;
    } else if (difference < 0) {
      alertMessage = `Sorry, you made a loss of ${currencySymbol}${Math.abs(
        difference
      ).toFixed(2)}. Next time can be better. 📉`;
    } else {
      alertMessage = "You broke even! No profit, no loss. 📊";
    }

    Alert.alert("Calculation Result", alertMessage);

    const sheetData = {
      title: sheetTitle,
      type: "trader",
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        costPrice: parseFloat(p.costPrice || 0),
        sellingPrice: parseFloat(p.sellingPrice || 0),
        initialStock: parseFloat(p.initialStock || 0),
        quantitySold: parseFloat(p.quantitySold || 0),
        lowStockThreshold: parseFloat(p.lowStockThreshold || 0),
        currentStock: Number.isFinite(p.currentStock) ? p.currentStock : 0,
      })),
      generalExpenses: generalExpenses.map((exp) => ({
        id: exp.id,
        name: exp.name,
        amount: parseFloat(exp.amount || 0),
      })),
      totalSales,
      totalExpenses,
      profitOrLoss: difference,
    };

    try {
      if (isExistingSheet) {
        await updateSheet(String(resolvedSheetId), sheetData);
        Alert.alert("Success", "Sheet updated locally!");
      } else {
        await createSheet(sheetData);
        Alert.alert("Success", "New sheet saved locally!");
      }
    } catch (e) {
      console.error("Error saving sheet: ", e);
      Alert.alert("Error", "Failed to save sheet to local storage.");
    }
  };

  if (loading) {
    return (
      <View style={CommonStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

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
        <View style={styles.section}>
          <Text style={CommonStyles.sectionHeader}>EXPENSES</Text>
          <Text style={styles.subHeader}>Product Costs:</Text>
          {products.map((product, index) => (
            <View key={product.id} style={styles.productInputGroup}>
              <EditableInputRow
                label="Product Name"
                value={product.name}
                onChangeText={(text) =>
                  handleProductChange(index, "name", text)
                }
              />
              <EditableInputRow
                label="Cost Price (Unit)"
                value={product.costPrice}
                onChangeText={(text) =>
                  handleProductChange(index, "costPrice", text)
                }
                keyboardType="numeric"
              />
              <EditableInputRow
                label="Initial Stock"
                value={product.initialStock}
                onChangeText={(text) =>
                  handleProductChange(index, "initialStock", text)
                }
                keyboardType="numeric"
              />
              <EditableInputRow
                label="Quantity Sold"
                value={product.quantitySold}
                onChangeText={(text) =>
                  handleProductChange(index, "quantitySold", text)
                }
                keyboardType="numeric"
              />
              <EditableInputRow
                label="Low Stock Threshold"
                value={product.lowStockThreshold}
                onChangeText={(text) =>
                  handleProductChange(index, "lowStockThreshold", text)
                }
                keyboardType="numeric"
              />
              {product.initialStock && product.quantitySold && (
                <Text style={styles.currentStockText}>
                  Current Stock:{" "}
                  {product.currentStock !== undefined
                    ? product.currentStock
                    : "N/A"}
                </Text>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addMoreButton} onPress={addProduct}>
            <Text style={styles.addMoreButtonText}>+ Add Product</Text>
          </TouchableOpacity>

          <Text style={[styles.subHeader, { marginTop: 20 }]}>
            General Expenses:
          </Text>
          {generalExpenses.map((exp) => (
            <EditableInputRow
              key={exp.id}
              label={exp.name}
              value={exp.amount}
              onChangeText={(text) => handleGeneralExpenseChange(exp.id, text)}
              keyboardType="numeric"
            />
          ))}
          <Text style={CommonStyles.totalText}>
            Total Expenses: {currencySymbol}
            {calculateTotalExpenses().toFixed(2)}
          </Text>
        </View>

        <View style={CommonStyles.thinLine} />

        <View style={styles.section}>
          <Text style={CommonStyles.sectionHeader}>SALES</Text>
          <Text style={styles.subHeader}>Product Sales:</Text>
          {products.map((product, index) => (
            <View key={product.id} style={styles.productInputGroup}>
              <Text style={CommonStyles.editableTextLabel}>
                {product.name || `Product ${index + 1}`}
              </Text>
              <EditableInputRow
                label="Selling Price (Unit)"
                value={product.sellingPrice}
                onChangeText={(text) =>
                  handleProductChange(index, "sellingPrice", text)
                }
                keyboardType="numeric"
              />
              <Text style={styles.calculatedValue}>
                Total Sales for {product.name || "Product"}: {currencySymbol}
                {(
                  parseFloat(product.sellingPrice || 0) *
                  parseFloat(product.quantitySold || 0)
                ).toFixed(2)}
              </Text>
            </View>
          ))}
          <Text style={CommonStyles.totalText}>
            Total Sales: {currencySymbol}
            {calculateTotalSales().toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          style={CommonStyles.submitButton}
          onPress={handleSaveOrSubmit}
        >
          <Text style={CommonStyles.submitButtonText}>
            {isExistingSheet ? "Update Sheet" : "Save Sheet & Calculate"}
          </Text>
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
  subHeader: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#555",
  },
  productInputGroup: {
    backgroundColor: "#e6f7ff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#b3e0ff",
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
  currentStockText: {
    fontSize: 14,
    color: "red",
    marginTop: 5,
    fontWeight: "bold",
  },
});
