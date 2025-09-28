import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid'; // You'll need to install 'uuid'

const SHEETS_KEY = '@afo-app:sheets';

export const saveSheet = async (sheet) => {
  try {
    const existingSheets = await getSheets();
    const newSheet = { ...sheet, id: uuidv4() };
    existingSheets.push(newSheet);
    await AsyncStorage.setItem(SHEETS_KEY, JSON.stringify(existingSheets));
    return newSheet;
  } catch (e) {
    console.error('Failed to save sheet:', e);
  }
};

export const getSheets = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(SHEETS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to get sheets:', e);
    return [];
  }
};

export const clearSheets = async () => {
  try {
    await AsyncStorage.removeItem(SHEETS_KEY);
  } catch (e) {
    console.error('Failed to clear sheets:', e);
  }
};