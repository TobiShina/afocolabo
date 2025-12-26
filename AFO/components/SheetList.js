// components/SheetList.js
import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useApp } from "../context/AppContext";

const SheetList = () => {
  const { savedSheets, loadSheetFromList } = useApp();

  const renderItem = ({ item }) => {
    const date = new Date(item.date).toLocaleDateString();

    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => loadSheetFromList(item)}
      >
        <Text style={styles.title}>{item.type.toUpperCase()} Sheet</Text>
        <Text>Date: {date}</Text>
        <Text style={styles.viewText}>Tap to View/Edit</Text>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={savedSheets.sort((a, b) => new Date(b.date) - new Date(a.date))} // Sort by newest first
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{ padding: 15 }}
      ListEmptyComponent={
        <Text style={{ textAlign: "center", marginTop: 50 }}>
          No saved sheets yet.
        </Text>
      }
    />
  );
};

const styles = StyleSheet.create({
  listItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderLeftWidth: 5,
    borderLeftColor: "#1E90FF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  viewText: {
    marginTop: 5,
    color: "#1E90FF",
    fontStyle: "italic",
  },
});

export default SheetList;
