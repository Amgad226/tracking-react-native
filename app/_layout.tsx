import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="username" options={{ title: 'Enter Username' }} />
      <Stack.Screen name="location" options={{ title: 'Location Access' }} />
      
    </Stack>
  );
}
