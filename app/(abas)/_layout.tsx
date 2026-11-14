import { useEffect, useState } from 'react';
import { Tabs, Redirect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LayoutAbas() {
    const [verificando, setVerificando] = useState(true);
    const [logado, setLogado] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem('usuario_logado')
            .then((res) => {
                setLogado(res !== null);
            })
            .catch((err) => console.log(err))
            .finally(() => setVerificando(false));
    }, []);

    if (verificando) {
        return null;
    }

    if (!logado) {
        return <Redirect href="/" />;
    }

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
                name="quadras"
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
                name="ia"
                options={{
                    title: 'IA',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="smart-toy" size={size + 2} color={String(color)} />
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