// navigation/TabNavigator.js
import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useApp } from "../context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  Image,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TraderSheet from "../components/TraderSheet";
import ArtisanSheet from "../components/ArtisanSheet";
import SalarySheet from "../components/SalarySheet";
import SheetList from "../components/SheetList";
import { Colors, GlobalStyles } from "../components/SharedStyles";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { createNewSheet, currency, setCurrency } = useApp();
  const insets = useSafeAreaInsets();

  // Custom Header Component
  const HeaderTitle = ({ type }) => {
    // Logic for the Currency Box
    const [currencyInput, setCurrencyInput] = useState(currency);
    const handleCurrencyChange = () => {
      if (currencyInput.length > 0 && currencyInput.length <= 3) {
        setCurrency(currencyInput);
      } else {
        Alert.alert(
          "Invalid Currency",
          "Please enter a valid currency symbol (e.g., $, ₦, €)."
        );
      }
    };

    return (
      // Ensure padding top for notch/status bar area
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        {/* 1. Currency Input Box (Top Left) */}
        <TextInput
          style={styles.currencyInput}
          value={currencyInput}
          onChangeText={setCurrencyInput}
          onBlur={handleCurrencyChange} // Update on focus loss
          placeholder="Curr"
        />

        {/* 2. Logo and App Name (Top Center) */}
        <View style={styles.logoContainer}>
          {/* *** LOGO PLACEMENT: PASTE YOUR IMAGE HERE ***
                        Replace 'require(...)' with the path to your logo file (e.g., assets/afo_logo.png) 
                    */}
          <Image
            source={require("../assets/icon.png")} // **<-- UPDATE THIS PATH**
            style={styles.logoImage}
            accessibilityLabel="AFO App Logo"
          />
          <Text style={styles.appNameText}>finance</Text>
        </View>

        {/* 3. Plus Icon (Top Right) */}
        {type !== "list" ? (
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "New Account Sheet",
                "Do you want to start a new sheet? The current sheet will be saved.",
                [
                  { text: "Trader", onPress: () => createNewSheet("trader") },
                  { text: "Artisan", onPress: () => createNewSheet("artisan") },
                  {
                    text: "9-5 Salary",
                    onPress: () => createNewSheet("salary"),
                  },
                  { text: "Cancel", style: "cancel" },
                ]
              )
            }
            style={styles.plusIcon}
          >
            <Ionicons
              name="add-circle"
              size={30}
              color={Colors.PRIMARY_GREEN}
            />
          </TouchableOpacity>
        ) : (
          // Placeholder to balance the layout when the Plus icon is absent on the 'List' tab
          <View style={styles.plusIconPlaceholder} />
        )}
      </View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Trader")
            iconName = focused ? "cube" : "cube-outline";
          else if (route.name === "Artisan")
            iconName = focused ? "hammer" : "hammer-outline";
          else if (route.name === "Salary")
            iconName = focused ? "cash" : "cash-outline";
          else if (route.name === "List")
            iconName = focused ? "list-circle" : "list-circle-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.TAB_ACTIVE,
        tabBarInactiveTintColor: Colors.TAB_INACTIVE,
        // Use the custom header for all screens
        header: ({ route }) => {
          const type = route.name.toLowerCase().replace(" ", "");
          return <HeaderTitle type={type} />;
        },
      })}
    >
      <Tab.Screen name="Trader" component={TraderSheet} />
      <Tab.Screen name="Artisan" component={ArtisanSheet} />
      <Tab.Screen name="Salary" component={SalarySheet} />
      <Tab.Screen name="List" component={SheetList} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 80, // Standard header height below status bar
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingHorizontal: 10,
  },
  currencyInput: {
    ...GlobalStyles.input,
    width: 60,
    height: 35,
    marginRight: 10,
    padding: 4,
    textAlign: "center",
    backgroundColor: Colors.CURRENCY_BOX,
    marginBottom: 0, // Override input default margin
    fontWeight: "bold",
    fontSize: 16,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // Allows the logo/text combo to occupy center space
    justifyContent: "center",
  },
  logoImage: {
    width: 24, // Small size for the logo image
    height: 24,
    marginRight: 5,
    // If your logo image has a transparent background, you might not need tinting
    // tintColor: '#1E90FF',
  },
  appNameText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E90FF",
  },
  plusIcon: {
    padding: 5,
    width: 40,
    alignItems: "flex-end",
  },
  plusIconPlaceholder: {
    width: 40, // Match the width of the icon container for alignment
  },
});

export default TabNavigator;
