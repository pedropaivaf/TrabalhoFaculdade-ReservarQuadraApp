import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { globalStyles } from '../../styles/global';
import { Quadra } from '../../src/types/Quadra';
import { Reserva } from '../../src/types/Reservas';
import { Usuario } from '../../src/types/Usuario';
import { dataHoje, horarioJaPassou, horarioOcupado, reservaAtiva } from '../../src/utils/reservas';
import { CardQuadra } from '../../src/components/CardQuadra';
import { ModalConfirmacao } from '../../src/components/ModalConfirmacao';
import { reservaEvents } from '../../src/events/reservaEvent';
import dadosQuadras from '../../src/types/data/quadras.json';

const quadras: Quadra[] = dadosQuadras;
const CHAVE_LOGADO = 'usuario_logado';
const CHAVE_RESERVAS = 'reservas';

type Selecao = {
    quadra: Quadra;
    horario: string;
};

export default function QuadrasScreen() {
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [selecao, setSelecao] = useState<Selecao | null>(null);

    const carregarReservas = () => {
        AsyncStorage.getItem(CHAVE_RESERVAS)
            .then((res) => {
                setReservas(res ? JSON.parse(res) : []);
            })
            .catch((err) => console.log(err));
    };

    // Para primeira vez que carrega a tela
    useEffect(() => {
        AsyncStorage.getItem(CHAVE_LOGADO)
            .then((res) => {
                setUsuario(res ? JSON.parse(res) : null);
            })
            .catch((err) => console.log(err));

        carregarReservas();
    }, []);

    // Para quando uma reserva é feita ou cancelada em outra aba
    useEffect(() => {
        // ouvir evento e recarregar reservas
        const subscription = reservaEvents.addListener('reservas:changed', carregarReservas);

        // limpar quando desmontar
        return () => subscription.remove();
    }, []);

    const escolherHorario = (quadra: Quadra, horario: string) => {
        if (!usuario) {
            alert('Faça login para reservar.');
            router.replace('/');
            return;
        }

        if (horarioJaPassou(horario)) {
            alert('Este horário já passou!');
            return;
        }

        if (horarioOcupado(reservas, quadra.id, horario)) {
            alert('Este horário já está reservado!');
            return;
        }

        const jaTemReserva = reservas.some(
            (r) => r.usuarioEmail === usuario.email && reservaAtiva(r)
        );

        if (jaTemReserva) {
            alert('Você já tem uma reserva ativa. Cancele na aba Reservas para fazer outra.');
            return;
        }

        setSelecao({ quadra, horario });
    };

    const confirmarReserva = () => {
        if (!selecao || !usuario) {
            return;
        }

        const novaReserva: Reserva = {
            id: String(Date.now()),
            usuarioEmail: usuario.email,
            quadraId: selecao.quadra.id,
            quadraNome: selecao.quadra.nome,
            esporte: selecao.quadra.esporte,
            data: dataHoje(),
            horario: selecao.horario,
        };

        const listaAtualizada = [...reservas, novaReserva];

        AsyncStorage.setItem(CHAVE_RESERVAS, JSON.stringify(listaAtualizada))
            .then(() => {
                setReservas(listaAtualizada);
                setSelecao(null);
                reservaEvents.emit('reservas:changed'); // notifica que as reservas mudaram
            })
            .catch((err) => {
                console.log(err);
                alert('Erro ao fazer reserva.');
            });
    };

    return (
        <SafeAreaView style={globalStyles.container} edges={['top']}>
            <View style={globalStyles.content}>
                <Text style={globalStyles.titulo}>Quadras Disponíveis</Text>
                <Text style={globalStyles.subtitulo}>
                    Toque em um horário para reservar
                </Text>

                <FlatList
                    data={quadras}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <CardQuadra quadra={item} reservas={reservas} onEscolherHorario={escolherHorario} />
                    )}
                />
            </View>

            <ModalConfirmacao
                visivel={selecao !== null}
                titulo="Confirmar reserva"
                mensagem={
                    selecao
                        ? `${selecao.quadra.nome} (${selecao.quadra.esporte})\nHoje às ${selecao.horario} - R$ ${selecao.quadra.precoHora.toFixed(2)}`
                        : ''
                }
                textoConfirmar="Reservar"
                onConfirmar={confirmarReserva}
                onCancelar={() => setSelecao(null)}
            />
        </SafeAreaView>
    );
}
