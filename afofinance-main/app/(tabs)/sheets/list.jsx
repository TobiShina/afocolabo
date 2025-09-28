import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { getSheets, clearSheets } from '../../../components/AsyncStorageManager';
import { CommonStyles } from '../../../components/CommonStyles';

export default function SheetsListScreen() {
  const [sheets, setSheets] = useState([]);

  const loadSheets = async () => {
    const allSheets = await getSheets();
    setSheets(allSheets);
  };

  useEffect(() => {
    loadSheets();
  }, []);

  const handleClear = async () => {
    Alert.alert(
      "Clear Sheets",
      "Are you sure you want to delete all saved sheets? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
{
          text: "Clear All",
          onPress: async () => {
            await clearSheets();
            setSheets([]);
          },
          style: "destructive"
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.sheetItem}>
  <Text style={styles.sheetTitle}>{item.title}</Text>
      <Text style={styles.sheetType}>{item.type}</Text>
    </View>
  );

  return (
    <View style={CommonStyles.container}>
      {sheets.length > 0 ? (
        <FlatList
          data={sheets}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No saved sheets yet.</Text>
        </View>
      )}
      <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
        <Text style={styles.clearButtonText}>Clear All Sheets</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sheetType: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
  },
  clearButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});