import React from "react";
import { TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";

export default function PlusButton() {
  const router = useRouter();

  const handlePress = () => {
    Alert.alert("Create or View Sheets", "What would you like to do?", [
      {
        text: "Create New Sheet",
        onPress: () => {
          Alert.alert(
            "Select Sheet Type",
            "Which type of account sheet do you want to create?",
            [
              { text: "Trader", onPress: () => router.push("/sheets/trader") },
              {
                text: "9-5 Salary Earner",
                onPress: () => router.push("/sheets/salary"),
              },
              {
                text: "Artisan",
                onPress: () => router.push("/sheets/artisan"),
              },
              { text: "Cancel", style: "cancel" },
            ]
          );
        },
      },
      {
        text: "View Past Sheets",
        onPress: () => {
          Alert.alert(
            "Select Sheet Type",
            "Which type of past sheets do you want to view?",
            [
              {
                text: "Trader",
                onPress: () => router.push("/sheets/list?type=trader"),
              },
              {
                text: "9-5 Salary Earner",
                onPress: () => router.push("/sheets/list?type=salary"),
              },
              {
                text: "Artisan",
                onPress: () => router.push("/sheets/list?type=artisan"),
              },
              { text: "Cancel", style: "cancel" },
            ]
          );
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Text style={styles.text}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginRight: 15,
    backgroundColor: "#28a745", // Green plus icon
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
});