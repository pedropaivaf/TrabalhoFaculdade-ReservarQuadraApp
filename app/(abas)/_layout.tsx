import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function LayoutAbas() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#1b1b1b',
                    borderTopColor: '#2a2a2a',
                },
                tabBarActiveTintColor: '#22c55e',
                tabBarInactiveTintColor: '#aaa',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Quadras',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="sports-soccer" size={size + 2} color={String(color)} />
                    ),
                }}
            />

            <Tabs.Screen
                name="reservas"
                options={{
                    title: 'Reservas',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="event-available" size={size + 2} color={String(color)} />
                    ),
                }}
            />

            <Tabs.Screen
                name="dicas"
                options={{
                    title: 'Dicas IA',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="lightbulb" size={size + 2} color={String(color)} />
                    ),
                }}
            />

            <Tabs.Screen
                name="perfil"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="person" size={size + 2} color={String(color)} />
                    ),
                }}
            />
        </Tabs>
    );
}