import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../styles/global';

export default function HomeScreen() {
    return (
        <SafeAreaView style={globalStyles.container}>
            <View style={globalStyles.content}>
                <Text style={globalStyles.titulo}>⚽ Reserva de Quadras</Text>
                <Text style={globalStyles.subtitulo}>
                    Agende seu horário de jogo de forma simples
                </Text>
            </View>
        </SafeAreaView>
    );
}
