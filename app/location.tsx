import { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, TextInput } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useLocalSearchParams } from 'expo-router';
import { api } from '@/constants/Server';

export const LOCATION_TASK_NAME = 'background-location-task';
let count = 0;

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }: { data: { locations: [{ coords: any, mocked: boolean, timestamp: number }] }, error: any }) => {
  if (error) {
    console.error('Error in background task:', error);
    return;
  }
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

export default function LocationScreen() {
  const { username } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [intervalTime, setIntervalTime] = useState(1000); // Default 1 minute interval

  useEffect(() => {
    (async () => {
      console.log("useEffect")
      // Check if task is already registered
      let isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
      console.log(`is task registerd ? ${isRegistered}`)
      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
        
      }

      console.log(`requestForegroundPermissionsAsync`)
      // Request foreground location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }
      console.log(`requestBackgroundPermissionsAsync`)

      // Request background location permission
      let { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        setError('Permission for background location was denied');
        setLoading(false);
        return;
      }

      console.log(`time intervial to set is : ${intervalTime}`)
      setLoading(false);

      // Restart background task with the specified interval
       Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000, // Use the interval time state here
        distanceInterval: 1, // 1 meter
        foregroundService: {
          notificationTitle: "Tracking Your Location",
          notificationBody: "Your location is being used in the background.",
          killServiceOnDestroy: false, // Prevents MIUI from killing the service
          notificationColor:"#FF00FF"
        },
      }).then(()=>{
        console.log("startLocationUpdatesAsync ok")
      });

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: intervalTime, // Use the interval time state here
        distanceInterval: 1, // 1 meter
        foregroundService: {
          notificationTitle: "Tracking Your Location",
          notificationBody: "Your location is being used in the background.",
          killServiceOnDestroy: false, // Prevents MIUI from killing the service
          notificationColor:"#FF00FF"
        },
      })

    })();

  }, [intervalTime]); // Trigger task restart when intervalTime changes

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <Text>Username: {username}</Text>

          <Text>enter time intervial in ms</Text>
          <TextInput
            style={styles.input}
            value={intervalTime.toString()}
            onChangeText={(text) => setIntervalTime(Number(text))}
            keyboardType="numeric"
            placeholder="Set interval (ms)"
          />
          <Button title="Update Interval" onPress={() => setIntervalTime(intervalTime)} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 10,
    width: '80%',
    textAlign: 'center',
  },
});
