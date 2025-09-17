// navigation/AppNavigator.js
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { ActivityIndicator, View } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig"; // Your Firebase config

// Screens
import AuthScreen from "../screens/AuthScreen";
import HomeScreen from "../screens/HomeScreen";
import AddPostScreen from "../screens/AddPostScreen";

const Stack = createStackNavigator();
const Tab = createMaterialTopTabNavigator();

// Define your categories here
const categories = [
  "Infertility",
  "Housing",
  "Poverty",
  "Building Business",
  "Gambling",
  "Relationship",
  "Drug Addiction",
  "Health Challenge",
  "Aging",
];

// Tab Navigator for the main app content
function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="All" // Default category
      screenOptions={{
        tabBarScrollEnabled: true, // Allows horizontal scrolling for many tabs
        tabBarIndicatorStyle: { backgroundColor: "#6200EE" }, // Indicator color
        tabBarLabelStyle: { fontSize: 12, fontWeight: "bold" }, // Label style
        tabBarStyle: {
          backgroundColor: "#fff",
          elevation: 0,
          shadowOpacity: 0,
        }, // Style for the entire tab bar
        tabBarItemStyle: { width: "auto" }, // Allow tabs to size based on content
        tabBarActiveTintColor: "#6200EE",
        tabBarInactiveTintColor: "#888",
      }}
    >
      {/* Add an "All" category to see all posts */}
      <Tab.Screen
        name="All"
        component={HomeScreen}
        initialParams={{ category: "All" }}
      />
      {categories.map((category) => (
        <Tab.Screen
          key={category}
          name={category}
          component={HomeScreen}
          initialParams={{ category: category }}
        />
      ))}
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Handle user state changes
  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (initializing) setInitializing(false);
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="AddPost" component={AddPostScreen} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export { categories }; // Export categories for use elsewhere if needed
export default AppNavigator;
