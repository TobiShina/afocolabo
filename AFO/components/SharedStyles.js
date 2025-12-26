// components/SharedStyles.js
import { StyleSheet } from "react-native";

// Custom colors based on requirements
export const Colors = {
  // Right side (Sales/Workmanship/Salary) - Whitish-Green
  SALES_SIDE: "#E6FFE6", // Very light mint green
  // Left side (Expenses) - Whitish-Red
  EXPENSES_SIDE: "#FFE6E6", // Very light rose/pink
  PRIMARY_GREEN: "#008000",
  PRIMARY_RED: "#FF0000",
  // Tab Bar Colors
  TAB_INACTIVE: "#808080",
  TAB_ACTIVE: "#1E90FF",
  // Currency Box Default
  CURRENCY_BOX: "#F0F0F0",
};

export const GlobalStyles = StyleSheet.create({
  // Style for the two-section layout
  sheetContainer: {
    flexDirection: "row",
    flex: 1,
  },
  // Base style for the left and right panels
  panel: {
    flex: 1,
    padding: 15,
  },
  // Specific panel colors
  leftPanel: {
    backgroundColor: Colors.EXPENSES_SIDE,
    borderRightWidth: 1,
    borderColor: "#ccc",
  },
  rightPanel: {
    backgroundColor: Colors.SALES_SIDE,
  },
  // Common input style
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
});
