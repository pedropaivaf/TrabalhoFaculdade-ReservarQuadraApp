import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../../styles/global';

export default function DicasScreen() {
    return (
        <SafeAreaView style={globalStyles.container} edges={['top']}>
            <View style={globalStyles.content}>
                <Text style={globalStyles.tituloDicas}>Dicas com IA</Text>
                <Text style={globalStyles.subtitulo}>
                    Aqui você encontrará dicas e sugestões geradas por Inteligência Artificial para melhorar sua experiência.
                </Text>
            </View>
        </SafeAreaView>
    )
}