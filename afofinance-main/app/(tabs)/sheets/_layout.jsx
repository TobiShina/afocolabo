import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007bff",
        tabBarShowLabel: true,
        tabBarInactiveTintColor: "#8e8e93",
        tabBarStyle: {
          backgroundColor: "#ffffff",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="salary"
        options={{
          title: "Salary",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "cash" : "cash-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="artisan"
        options={{
          title: "Artisan",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "construct" : "construct-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="trader"
        options={{
          title: "Trader",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "cart" : "cart-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />

      <Tabs.Screen
        name="list"
        options={{
          title: "List",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "list" : "list-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}