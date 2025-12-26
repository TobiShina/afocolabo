// context/AppContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AppContext = createContext();
const STORAGE_KEY = "@AFO_Sheets";
const CURRENT_SHEET_KEY = "@AFO_CurrentSheet";

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [savedSheets, setSavedSheets] = useState([]);
  const [currentSheet, setCurrentSheet] = useState(null);
  const [currency, setCurrency] = useState("₦"); // Default: Nigerian Naira

  // --- Persistence Handlers ---
  const loadSheets = async () => {
    try {
      const sheetsJson = await AsyncStorage.getItem(STORAGE_KEY);
      if (sheetsJson) setSavedSheets(JSON.parse(sheetsJson));
      const currentSheetJson = await AsyncStorage.getItem(CURRENT_SHEET_KEY);
      if (currentSheetJson) setCurrentSheet(JSON.parse(currentSheetJson));
    } catch (e) {
      console.error("Failed to load sheets:", e);
    }
  };

  useEffect(() => {
    loadSheets();
  }, []);

  const saveSheet = async (sheetData) => {
    const newSheets = [...savedSheets, { ...sheetData, id: Date.now() }];
    setSavedSheets(newSheets);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSheets));
  };

  const updateCurrentSheet = async (sheetData) => {
    setCurrentSheet(sheetData);
    await AsyncStorage.setItem(CURRENT_SHEET_KEY, JSON.stringify(sheetData));
  };

  // --- Business Logic ---
  const createNewSheet = (type) => {
    // Save current sheet to local storage before creating new one
    if (currentSheet) {
      saveSheet(currentSheet);
    }

    // 👈 ADD DEFENSIVE INITIALIZATION HERE
    const newSheet = {
      type: type,
      date: new Date().toISOString(),
      // Trader/Artisan/General structure
      products: [], // Always initialize as empty array
      otherExpenses: [], // Always initialize as empty array
      // Salary specific structure
      dailyCosts: { transport: 0, lunch: 0 },
      salaryAmount: 0,
      otherMonthlyExpenses: [], // Always initialize as empty array
    };

    updateCurrentSheet(newSheet);
  };

  const loadSheetFromList = (sheet) => {
    setCurrentSheet(sheet);
  };

  return (
    <AppContext.Provider
      value={{
        savedSheets,
        currentSheet,
        currency,
        setCurrency,
        createNewSheet,
        saveSheet,
        updateCurrentSheet,
        loadSheetFromList,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
