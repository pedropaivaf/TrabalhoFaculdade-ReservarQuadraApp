import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../../styles/global';

export default function QuadrasScreen() {
    return (
        <SafeAreaView style={globalStyles.container} edges={['top']}>
            <View style={globalStyles.content}>
                <Text style={globalStyles.titulo}>Quadras Disponíveis</Text>
                <Text style={globalStyles.subtitulo}>
                    Escolha uma quadra para fazer sua reserva
                </Text>
            </View>
        </SafeAreaView>
    );
}