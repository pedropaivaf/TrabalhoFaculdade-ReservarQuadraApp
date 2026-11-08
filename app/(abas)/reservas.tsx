import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../../styles/global';

export default function ReservasScreen() {
    return (
        <SafeAreaView style={globalStyles.container} edges={['top']}>
            <View style={globalStyles.content}>
                <Text style={globalStyles.titulo}>Minhas Reservas</Text>
                <Text style={globalStyles.subtitulo}>
                    Seus horários agendados aparecem aqui
                </Text>
            </View>
        </SafeAreaView>
    );
}