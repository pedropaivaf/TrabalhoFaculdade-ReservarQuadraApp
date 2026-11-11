import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { globalStyles } from '../../styles/global';
import { Quadra } from '../../src/types/Quadra';
import { Reserva } from '../../src/types/Reservas';
import { Usuario } from '../../src/types/Usuario';
import { dataHoje, horarioJaPassou, reservaAtiva } from '../../src/utils/reservas';
import ModalConfirmacao from '../../src/components/ModalConfirmacao';
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

    useFocusEffect(
        useCallback(() => {
            AsyncStorage.getItem(CHAVE_LOGADO)
                .then((res) => {
                    setUsuario(res ? JSON.parse(res) : null);
                })
                .catch((err) => console.log(err));

            AsyncStorage.getItem(CHAVE_RESERVAS)
                .then((res) => {
                    setReservas(res ? JSON.parse(res) : []);
                })
                .catch((err) => console.log(err));
        }, [])
    );

    const horarioOcupado = (quadraId: string, horario: string) => {
        return reservas.some(
            (r) => r.quadraId === quadraId && r.data === dataHoje() && r.horario === horario
        );
    };

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

        if (horarioOcupado(quadra.id, horario)) {
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
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.nome}>{item.nome}</Text>
                            <Text style={styles.esporte}>{item.esporte}</Text>
                            <Text style={styles.preco}>R$ {item.precoHora.toFixed(2)} / hora</Text>

                            <View style={styles.listaHorarios}>
                                {item.horarios.map((horario) => {
                                    const indisponivel =
                                        horarioJaPassou(horario) || horarioOcupado(item.id, horario);

                                    return (
                                        <TouchableOpacity
                                            key={horario}
                                            style={[styles.horario, indisponivel && styles.horarioIndisponivel]}
                                            disabled={indisponivel}
                                            onPress={() => escolherHorario(item, horario)}
                                        >
                                            <Text style={[styles.textoHorario, indisponivel && styles.textoIndisponivel]}>
                                                {horario}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
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
        color: '#fff',
        fontSize: 16,
        marginTop: 8,
    },
    listaHorarios: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    horario: {
        borderWidth: 1,
        borderColor: '#22c55e',
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    horarioIndisponivel: {
        borderColor: '#333',
        backgroundColor: '#222',
    },
    textoHorario: {
        color: '#22c55e',
        fontSize: 14,
        fontWeight: 'bold',
    },
    textoIndisponivel: {
        color: '#555',
        textDecorationLine: 'line-through',
    },
});
