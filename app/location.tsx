import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useLocalSearchParams } from 'expo-router';
import { api } from '@/constants/Server';
import Toast from 'react-native-toast-message';

const LOCATION_TASK_NAME = 'background-location-task';

// Move TaskManager.defineTask outside the component
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.log('Background Location Error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    if (!locations.length) return;

    const { latitude, longitude } = locations[0].coords;
    
    // Get stored last location
    const lastLocation = global.lastLocation || null;

    if (lastLocation && lastLocation.latitude === latitude && lastLocation.longitude === longitude) {
      return;
    }

    global.lastLocation = { latitude, longitude };

    try {
      await fetch(api + '/update-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: global.username || 'defaultUser', latitude, longitude }),
      });

      console.log('Location updated:', latitude, longitude);
    } catch (error) {
      console.log('Failed to send data:', error);
    }
  }
});

export default function LocationScreen() {
  const { username } = useLocalSearchParams();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      global.username = username;

      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        let { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

        if (status !== 'granted' || backgroundStatus !== 'granted') {
          setError('Permission to access location was denied');
          setLoading(false);
          return;
        }

        let loc = await Location.getCurrentPositionAsync({});
        setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        setLoading(false);

        // Check if the task is already running
        const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
        if (!isRegistered) {
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000,
            distanceInterval: 1,
            showsBackgroundLocationIndicator: true,
          });
        }
      } catch (err) {
        setError('Failed to get location');
        setLoading(false);
      }
    })();
  }, [username]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <Text>Username: {username}</Text>
          <Text>Latitude: {location?.latitude}</Text>
          <Text>Longitude: {location?.longitude}</Text>
        </>
      )}
      <Toast />
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
});
