// App.js

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AppProvider } from "./context/AppContext";
import TabNavigator from "./navigation/TabNavigator";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  return (
    // SafeAreaProvider is necessary for handling notches and screen insets
    <SafeAreaProvider>
      {/* AppProvider wraps the entire application to give every component access to the global state (sheets, currency) */}
      <AppProvider>
        {/* NavigationContainer manages the navigation state for the entire app */}
        <NavigationContainer>
          <TabNavigator />
          {/* Automatically adjust status bar style */}
          <StatusBar style="auto" />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
