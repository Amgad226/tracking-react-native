import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { useLocalSearchParams } from 'expo-router';
import { api } from '@/constants/Server';
import Toast from 'react-native-toast-message'; 

const LOCATION_TASK_NAME = 'background-location-task';

export default function LocationScreen() {
  const { username } = useLocalSearchParams();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    (async () => {
      global.username = username;

      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      let { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

      if (status !== 'granted' || backgroundStatus !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }

      // Get the current location
      let loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setLoading(false);

      // Start tracking location updates in the background
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000, // 1 second interval
        distanceInterval: 1, // Only update when moving 1 meter
        showsBackgroundLocationIndicator: true,
      });
    })();
  }, []);

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
      <Toast /> {/* Toast component to show location update messages */}
    </View>
  );
}

// Define background location tracking task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    
    console.log('Background Location Error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const latestLocation = locations[0];

    if (!latestLocation) return;

    const { latitude, longitude } = latestLocation.coords;

    // Retrieve last known location
    let lastLocation = global.lastLocation || null;

    // If location hasn't changed, don't send a request
    if (lastLocation && lastLocation.latitude === latitude && lastLocation.longitude === longitude) {
      return;
    }

    // Update global last location
    global.lastLocation = { latitude, longitude };

    const username = global.username || 'defaultUser';

    // Send updated location to server
    try {
      await fetch(api + '/update-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          latitude,
          longitude,
        }),
      }).catch(e => {
        console.log(e)

      });


      // Show a toast notification with the new location
      // Toast.show({
      //   type: 'success',
      //   text1: 'Location Updated',
      //   text2: `Lat: ${latitude}, Lng: ${longitude}`,
      //   position: 'bottom',
      // });

      // setLocation({ latitude, longitude } )
    } catch (error) {
      console.log('Failed to send data:', error);
      // Toast.show({
      //   type: 'error',
      //   text1: 'Location Update Failed',
      //   text2: 'Could not send location to server',
      // });
    }
  }
});

// Styles for UI
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