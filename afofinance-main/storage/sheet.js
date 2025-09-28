// storage/sheets.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const LIST_KEY = "traderSheets:list"; // stores an array of sheet IDs
const ITEM_KEY = (id) => `traderSheets:item:${id}`;

const readJSON = async (key, fallback) => {
  try {
    const v = await AsyncStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = async (key, value) => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

const nowIso = () => new Date().toISOString();
const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export async function getSheetIds() {
  return readJSON(LIST_KEY, []);
}

export async function getSheetById(id) {
  return readJSON(ITEM_KEY(id), null);
}

export async function upsertSheet(sheet) {
  // sheet must include an id
  const ids = await getSheetIds();
  if (!ids.includes(sheet.id)) {
    ids.push(sheet.id);
    await writeJSON(LIST_KEY, ids);
  }
  await writeJSON(ITEM_KEY(sheet.id), sheet);
  return sheet.id;
}

export async function createSheet(data) {
  const id = newId();
  const sheet = {
    id,
    title: data.title ?? `Trader Sheet - ${new Date().toLocaleDateString()}`,
    type: "trader",
    products: data.products ?? [],
    generalExpenses: data.generalExpenses ?? [],
    totalSales: data.totalSales ?? 0,
    totalExpenses: data.totalExpenses ?? 0,
    profitOrLoss: data.profitOrLoss ?? 0,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  await upsertSheet(sheet);
  return id;
}

export async function updateSheet(id, patch) {
  const current = (await getSheetById(id)) ?? { id };
  const next = { ...current, ...patch, id, updatedAt: nowIso() };
  await upsertSheet(next);
  return id;
}

export async function deleteSheet(id) {
  const ids = await getSheetIds();
  const nextIds = ids.filter((x) => x !== id);
  await writeJSON(LIST_KEY, nextIds);
  await AsyncStorage.removeItem(ITEM_KEY(id));
}
