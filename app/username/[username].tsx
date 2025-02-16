import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { io } from "socket.io-client";
import { api } from "@/constants/Server";

let MapView: any;
let Marker: any;

if (Platform.OS === "web") {
  // Use Leaflet or other map library for web if needed
  // Add your WebMap component here (Leaflet or others)
} else {
  // alert()
  MapView = require("react-native-maps").default;
  Marker = require("react-native-maps").Marker;
}

export default function UserSocketScreen() {
  const { username } = useLocalSearchParams();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const INITIAL_REGION = {
    latitude: 34.8021,   // Approximate center of Syria
    longitude: 39.6065,  // Approximate center of Syria
    latitudeDelta: 6,    // Adjust for zoom level
    longitudeDelta: 6    // Adjust for zoom level
  };

  const socket = useRef(io(api)).current;

  useEffect(() => {
    // Subscribe to user on socket connection
    socket.emit("subscribeToUser", username);

    // Listen for location updates from the socket
    socket.on("locationUpdate", (data) => {
      setLocation(data); // Update the state with new location
    });

    // Cleanup socket event listeners when the component unmounts
    return () => {
      socket.off("locationUpdate");
    };
  }, [username]);

  const mapRef = useRef(null); // MapView reference to control zoom

  const onMarkerPress = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location?.latitude || INITIAL_REGION.latitude,
        longitude: location?.longitude || INITIAL_REGION.longitude,
        latitudeDelta: 0.1,  // Zoom level for more detail
        longitudeDelta: 0.1, // Zoom level for more detail
      }, 1000); // 1000 ms animation time
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tracking {username}'s Location</Text>
      {location ? (
        <Text style={styles.message}>
          Lat: {location.latitude}, Lon: {location.longitude}
        </Text>
      ) : (
        <Text style={styles.message}>No location data available</Text>
      )}

      {Platform.OS === 'web' ? (
        // Web version with Leaflet or other map library
        <Text>Web version map (placeholder)</Text>
      ) : (
        // Native version with react-native-maps
        <MapView
          style={StyleSheet.absoluteFillObject}
          initialRegion={INITIAL_REGION}
          region={{
            latitude:  INITIAL_REGION.latitude,
            longitude:  INITIAL_REGION.longitude,
            latitudeDelta: INITIAL_REGION.latitudeDelta,
            longitudeDelta: INITIAL_REGION.longitudeDelta,
          }}
          ref={mapRef} // Attach mapRef to the MapView
          showsUserLocation
          showsMyLocationButton
        >
          <Marker
            coordinate={{
              latitude: location?.latitude || INITIAL_REGION.latitude,
              longitude: location?.longitude || INITIAL_REGION.longitude
            }}
            onPress={onMarkerPress} // Trigger zoom on click
          />
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    marginTop: 5,
  },
});
