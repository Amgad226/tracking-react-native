import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function UserListScreen() {
    const [usernames, setUsernames] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUsernames = async () => {
            try {
                // const response = await fetch('http://192.168.43.194:3000//usernames');
                const response = await fetch('http://192.168.43.194:3000/usernames', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                const data = await response.json();
                setUsernames(data);
            } catch (error) {
                alert('Failed to fetch usernames');
            } finally {
                setLoading(false);
            }
        };

        fetchUsernames();
    }, []);

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                usernames.map((username) => (
                    <TouchableOpacity
                        key={username}
                        style={styles.usernameItem}
                        onPress={() => router.push(`/username/${username}`)}
                    >
                        <Text style={styles.usernameText}>{username}</Text>
                    </TouchableOpacity>
                ))
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
    usernameItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        width: '100%',
        alignItems: 'center',
    },
    usernameText: {
        fontSize: 18,
    },
});
