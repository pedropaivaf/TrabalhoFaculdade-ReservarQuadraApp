import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalStyles } from '../../styles/global';
import { Quadra } from '../../src/types/Quadra';
import dadosQuadras from '../../src/types/data/quadras.json';

const quadras: Quadra[] = dadosQuadras;

export default function QuadrasScreen() {
    return (
        <SafeAreaView style={globalStyles.container} edges={['top']}>
            <View style={globalStyles.content}>
                <Text style={globalStyles.titulo}>Quadras Disponíveis</Text>
                <Text style={globalStyles.subtitulo}>
                    Escolha uma quadra para reservar
                </Text>

                <FlatList
                    data={quadras}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.nome}>{item.nome}</Text>
                            <Text style={styles.esporte}>{item.esporte}</Text>
                            <Text style={styles.preco}>R$ {item.precoHora.toFixed(2)} / hora</Text>
                            <Text style={styles.horarios}>
                                Horários: {item.horarios.join(' • ')}
                            </Text>
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1b1b1b',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
    },
    nome: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    esporte: {
        color: '#22c55e',
        fontSize: 14,
        marginTop: 4,
    },
    preco: {
        color: '#22c55e',
        fontSize: 16,
        marginTop: 8,
    },
    horarios: {
        color: '#aaa',
        fontSize: 13,
        marginTop: 6,
    },
})