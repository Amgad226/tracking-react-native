import { View, Button, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import * as TaskManager from 'expo-task-manager';
import { LOCATION_TASK_NAME } from '../location';
import { api } from '@/constants/Server';
import { useState } from 'react';
import { getPowerState } from "react-native-device-info";

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: { data: { locations: [{ coords: any, mocked: boolean, timestamp: number }] }, error: any }) => {
  if (error) {
    console.error('Error in Background task:', error);
    return;
  }
  console.log("Background Task Started ")
  if (data) {
    const { locations } = data;
    const location = locations[0];

    if (location) {
      const { latitude, longitude, speed } = location.coords;
      const timestamp = location.timestamp

      try {
        const powerState = await getPowerState();
        const battary = powerState.batteryLevel;

        const event = { latitude, longitude, speed, battary, timestamp, username: global?.username ?? "samsung" };
        console.log("Background Task ", event)
        await fetch(api + '/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        });
      } catch (err) {
        console.error('Failed to send location via fetch request:', err);
      }
    }
  }
});
function makeid(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
export default function HomeScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('Mobile');

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        value={username}
        onChangeText={setUsername}
      />
      <Button title="Share My GPS" onPress={() => router.push(`/location?username=${username}_${makeid(4)}`)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});
