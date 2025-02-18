import { View, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as TaskManager from 'expo-task-manager';
import { LOCATION_TASK_NAME } from '../location';
import { api } from '@/constants/Server';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: { data: { locations: [{ coords: any, mocked: boolean, timestamp: number }] }, error: any }) => {
  if (error) {
    console.error('Error in background task:', error);
    return;
  }
  // {"locations": [{"coords": [Object], "mocked": false, "timestamp": 1739838350566}]}
  console.log("Background Task ", data)
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
          body: JSON.stringify({ lat: latitude, longitude, username: "samsung", timestamp }),
        });
      } catch (err) {
        console.error('Failed to send location:', err);
      }
    }
  }
});
export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Button title="Share My GPS" onPress={() => router.push(`/location?username=samsuang`)} />
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
});
