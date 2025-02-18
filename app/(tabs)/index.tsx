import { View, Button, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import * as TaskManager from 'expo-task-manager';
import { LOCATION_TASK_NAME } from '../location';
import { api } from '@/constants/Server';
import { useState } from 'react';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: { data: { locations: [{ coords: any, mocked: boolean, timestamp: number }] }, error: any }) => {
  if (error) {
    console.error('Error in background task:', error);
    return;
  }
  // {"locations": [{"coords": [Object], "mocked": false, "timestamp": 1739838350566}]}
  console.log("Background Task IN index page ")
  if (data) {
    const { locations } = data;
    const location = locations[0];

    if (location) {
      const { latitude, longitude } = location.coords;
      const timestamp = location.timestamp
      console.log('Background Task get these coordinates:', latitude, longitude);

      try {
        await fetch(api + '/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: latitude, longitude, username: "samsung", timestamp ,indexPage:"IN index page" }),
        });
      } catch (err) {
        console.error('Failed to send location:', err);
      }
    }
  }
});
function makeid(length:number) {
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
