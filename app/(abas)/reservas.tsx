import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { globalStyles } from '../../styles/global';
import { Reserva } from '../../src/types/Reservas';
import { Usuario } from '../../src/types/Usuario';
import { formatarData, reservaAtiva } from '../../src/utils/reservas';
import ModalConfirmacao from '../../src/components/ModalConfirmacao';

const CHAVE_LOGADO = 'usuario_logado';
const CHAVE_RESERVAS = 'reservas';

export default function ReservasScreen() {
    const [minhasReservas, setMinhasReservas] = useState<Reserva[]>([]);
    const [reservaParaCancelar, setReservaParaCancelar] = useState<Reserva | null>(null);

    useFocusEffect(
        useCallback(() => {
            AsyncStorage.getItem(CHAVE_LOGADO)
                .then((resUsuario) => {
                    if (!resUsuario) {
                        setMinhasReservas([]);
                        return;
                    }

                    const usuario: Usuario = JSON.parse(resUsuario);

                    AsyncStorage.getItem(CHAVE_RESERVAS)
                        .then((res) => {
                            const todas: Reserva[] = res ? JSON.parse(res) : [];
                            setMinhasReservas(todas.filter((r) => r.usuarioEmail === usuario.email));
                        });
                })
                .catch((err) => console.log(err));
        }, [])
    );

    const confirmarCancelamento = () => {
        if (!reservaParaCancelar) {
            return;
        }

        const idCancelado = reservaParaCancelar.id;

        AsyncStorage.getItem(CHAVE_RESERVAS)
            .then((res) => {
                const todas: Reserva[] = res ? JSON.parse(res) : [];
                const restantes = todas.filter((r) => r.id !== idCancelado);

                AsyncStorage.setItem(CHAVE_RESERVAS, JSON.stringify(restantes))
                    .then(() => {
                        setMinhasReservas(minhasReservas.filter((r) => r.id !== idCancelado));
                        setReservaParaCancelar(null);
                    });
            })
            .catch((err) => {
                console.log(err);
                alert('Erro ao cancelar reserva.');
            });
    };

    return (
        <SafeAreaView style={globalStyles.container} edges={['top']}>
            <View style={globalStyles.content}>
                <Text style={globalStyles.titulo}>Minhas Reservas</Text>
                <Text style={globalStyles.subtitulo}>
                    Seus horários agendados aparecem aqui
                </Text>

                <FlatList
                    data={minhasReservas}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={
                        <Text style={styles.vazio}>Você ainda não tem reservas.</Text>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.nome}>{item.quadraNome}</Text>
                            <Text style={styles.esporte}>{item.esporte}</Text>
                            <Text style={styles.info}>
                                {formatarData(item.data)} às {item.horario}
                            </Text>

                            {reservaAtiva(item) ? (
                                <TouchableOpacity
                                    style={styles.botaoCancelar}
                                    onPress={() => setReservaParaCancelar(item)}
                                >
                                    <Text style={styles.textoCancelar}>Cancelar</Text>
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.concluida}>Concluída</Text>
                            )}
                        </View>
                    )}
                />
            </View>

            <ModalConfirmacao
                visivel={reservaParaCancelar !== null}
                titulo="Cancelar reserva"
                mensagem={
                    reservaParaCancelar
                        ? `Deseja cancelar ${reservaParaCancelar.quadraNome} às ${reservaParaCancelar.horario}?`
                        : ''
                }
                textoConfirmar="Cancelar reserva"
                corConfirmar="#ef4444"
                onConfirmar={confirmarCancelamento}
                onCancelar={() => setReservaParaCancelar(null)}
            />
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
    info: {
        color: '#fff',
        fontSize: 16,
        marginTop: 8,
    },
    botaoCancelar: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#ef4444',
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 14,
        marginTop: 12,
    },
    textoCancelar: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: 'bold',
    },
    concluida: {
        color: '#555',
        fontSize: 14,
        marginTop: 12,
    },
    vazio: {
        color: '#aaa',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 24,
    },
});
