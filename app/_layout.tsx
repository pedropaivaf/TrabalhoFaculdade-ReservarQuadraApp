import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: '#121212' },
                    headerTintColor: '#fff',
                }}
            >
                <Stack.Screen
                    name="index"
                    options={{ title: 'Início' }}
                />
            </Stack>
        </SafeAreaProvider>
    );
}
