import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function LayoutPrincipal() {
    return (
        <SafeAreaProvider>
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: '#121212' },
                    headerTintColor: '#fff',
                }}
            >
                <Stack.Screen
                    name="(abas)"
                    options={{ headerShown: false }}
                />
            </Stack>
            <Stack.Screen
                name="(abas)"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="cadastro"
                options={{ headerShown: false }}
            />
        </SafeAreaProvider>
    );
}
