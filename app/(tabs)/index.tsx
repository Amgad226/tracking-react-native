import { View, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Button title="Enter Username" onPress={() => router.push('/username')} />
      <Button title="View User List" onPress={() => router.push('/usernames')} />
      <Button title="map" onPress={() => router.push('/map')} />
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
