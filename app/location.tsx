import { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import { api } from '@/constants/Server';

export default function LocationScreen() {
  const { username } = useLocalSearchParams();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');


  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setLoading(false);
    })();
  }, []);

  const sendDataToBackend = async () => {
    if (!location) return;
    try {

      const response = await fetch(api + '/update-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });

      const data = await response.json();
      // alert(`Response: ${JSON.stringify(data)}`);
    } catch (error) {
      alert('Failed to send data');
    }
  };
  setInterval(() => {
    sendDataToBackend()
  }, 1000)
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
          <Button title="Send Data" onPress={sendDataToBackend} />
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
});
