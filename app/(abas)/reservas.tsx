import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { globalStyles } from '../../styles/global';
import { Reserva } from '../../src/types/Reservas';
import { Usuario } from '../../src/types/Usuario';
import { ItemReserva } from '../../src/components/ItemReserva';
import { ModalConfirmacao } from '../../src/components/ModalConfirmacao';
import { reservaEvents } from '../../src/events/reservaEvent';

const CHAVE_LOGADO = 'usuario_logado';
const CHAVE_RESERVAS = 'reservas';

export default function ReservasScreen() {
    const [minhasReservas, setMinhasReservas] = useState<Reserva[]>([]);
    const [reservaParaCancelar, setReservaParaCancelar] = useState<Reserva | null>(null);

    const listarReservas = () => {
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
    };

    // Para primeira vez que carrega a tela
    useEffect(() => {
        listarReservas();
    }, []);

    // Para quando uma reserva é feita em outra aba
    useEffect(() => {
        // ouvir evento e recarregar lista
        const subscription = reservaEvents.addListener('reservas:changed', listarReservas);

        // limpar quando desmontar
        return () => subscription.remove();
    }, []);

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
                        reservaEvents.emit('reservas:changed'); // libera o horário nas outras abas
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
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Text style={styles.vazio}>Você ainda não tem reservas.</Text>
                    }
                    renderItem={({ item }) => (
                        <ItemReserva reserva={item} onCancelar={(reserva) => setReservaParaCancelar(reserva)} />
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
    vazio: {
        color: '#aaa',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 24,
    },
});
