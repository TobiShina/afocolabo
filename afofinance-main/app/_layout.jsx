import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name='index'/>
      <StatusBar style="auto" />
    </Stack>
  );
}