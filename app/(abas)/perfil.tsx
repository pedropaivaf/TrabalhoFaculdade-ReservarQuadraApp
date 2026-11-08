import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../../styles/global';

export default function PerfilScreen() {
    return (
        <SafeAreaView style={globalStyles.container} edges={['top']}>
            <View style={globalStyles.content}>
                <Text style={globalStyles.titulo}>Meu Perfil</Text>
                <Text style={globalStyles.subtitulo}>
                    Gerencie seu perfil aqui
                </Text>
            </View>
        </SafeAreaView>
    );
}