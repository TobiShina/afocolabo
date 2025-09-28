import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CommonStyles } from "../components/CommonStyles"; // Assuming you create this

export default function HomeScreen() {
  const router = useRouter();
  const logo = require("../assets/images/icon.png"); // You'll provide this logo

  const handleSelectAccountType = (type) => {
    router.push(`/(tabs)/sheets/${type}`);
  };

  return (
    <SafeAreaView style={CommonStyles.container}>
      <View style={CommonStyles.logoContainer}>
        {/* Placeholder for your logo */}
        <Image source={logo} style={CommonStyles.logo} resizeMode="contain" />
      </View>

      <Text style={CommonStyles.title}>Choose Account Type</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.accountTypeButton}
          onPress={() => handleSelectAccountType("trader")}
        >
          <Text style={styles.buttonText}>Trader</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.accountTypeButton}
          onPress={() => handleSelectAccountType("salary")}
        >
          <Text style={styles.buttonText}>9-5 Salary Earner</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.accountTypeButton}
          onPress={() => handleSelectAccountType("artisan")}
        >
          <Text style={styles.buttonText}>Artisan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    display: 'flex',
    flexDirection: "column",
    justifyContent: "center",
    alignContent: "center",
    marginLeft: 42,
    width: "80%",
  },
  accountTypeButton: {
    backgroundColor: "#007bff", // Example color
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});