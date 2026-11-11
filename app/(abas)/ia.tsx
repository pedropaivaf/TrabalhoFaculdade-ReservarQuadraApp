import { useCallback, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
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

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const URL_GEMINI = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent';

type Sugestao = {
    quadra: Quadra;
    horario: string;
    motivo: string;
};

export default function IAScreen() {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [pedido, setPedido] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [sugestao, setSugestao] = useState<Sugestao | null>(null);
    const [mensagem, setMensagem] = useState('');
    const [confirmando, setConfirmando] = useState(false);

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

    const horariosLivres = (quadra: Quadra) => {
        return quadra.horarios.filter(
            (h) => !horarioJaPassou(h) && !horarioOcupado(quadra.id, h)
        );
    };

    const pedirSugestao = () => {
        if (!usuario) {
            alert('Faça login para usar o assistente.');
            router.replace('/');
            return;
        }

        if (!API_KEY) {
            alert('Chave da API não configurada no arquivo .env');
            return;
        }

        if (!pedido.trim()) {
            alert('Escreva o que você procura!');
            return;
        }

        const jaTemReserva = reservas.some(
            (r) => r.usuarioEmail === usuario.email && reservaAtiva(r)
        );

        if (jaTemReserva) {
            alert('Você já tem uma reserva ativa. Cancele na aba Reservas para fazer outra.');
            return;
        }

        const disponiveis = quadras
            .filter((q) => horariosLivres(q).length > 0)
            .map((q) => `id ${q.id} | ${q.nome} | ${q.esporte} | R$ ${q.precoHora}/hora | livres: ${horariosLivres(q).join(', ')}`);

        if (disponiveis.length === 0) {
            setSugestao(null);
            setMensagem('Não há mais horários livres hoje.');
            return;
        }

        const prompt =
            'Você é o assistente de reservas de um centro esportivo. ' +
            'Estes são os únicos horários livres hoje:\n' +
            disponiveis.join('\n') +
            `\n\nPedido do cliente: "${pedido.trim()}"\n\n` +
            'Escolha a melhor opção que atenda o pedido, usando somente os horários livres acima. ' +
            'Responda apenas com JSON neste formato: ' +
            '{"quadraId": "1", "horario": "20:00", "motivo": "frase curta em português explicando a escolha"}. ' +
            'Se nenhuma opção atender, responda {"quadraId": null, "horario": null, "motivo": "explique o motivo em português"}.';

        setCarregando(true);
        setSugestao(null);
        setMensagem('');

        fetch(URL_GEMINI, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': API_KEY,
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: 'application/json' },
            }),
        })
            .then((resposta) => resposta.json())
            .then((data) => {
                const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                const resultado = JSON.parse(texto);

                const quadra = quadras.find((q) => q.id === resultado.quadraId);

                if (quadra && horariosLivres(quadra).includes(resultado.horario)) {
                    setSugestao({ quadra, horario: resultado.horario, motivo: resultado.motivo });
                } else {
                    setMensagem(resultado.motivo || 'Nenhuma opção encontrada para o seu pedido.');
                }
            })
            .catch((erro) => {
                console.log('Erro:', erro);
                setMensagem('Erro ao conectar com a IA. Tente novamente.');
            })
            .finally(() => setCarregando(false));
    };

    const confirmarReserva = () => {
        if (!sugestao || !usuario) {
            return;
        }

        const novaReserva: Reserva = {
            id: String(Date.now()),
            usuarioEmail: usuario.email,
            quadraId: sugestao.quadra.id,
            quadraNome: sugestao.quadra.nome,
            esporte: sugestao.quadra.esporte,
            data: dataHoje(),
            horario: sugestao.horario,
        };

        const listaAtualizada = [...reservas, novaReserva];

        AsyncStorage.setItem(CHAVE_RESERVAS, JSON.stringify(listaAtualizada))
            .then(() => {
                setReservas(listaAtualizada);
                setConfirmando(false);
                setSugestao(null);
                setPedido('');
                setMensagem('Reserva confirmada! Veja na aba Reservas.');
            })
            .catch((err) => {
                console.log(err);
                alert('Erro ao fazer reserva.');
            });
    };

    return (
        <SafeAreaView style={globalStyles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={globalStyles.content}>
                    <Text style={globalStyles.titulo}>Assistente IA</Text>
                    <Text style={globalStyles.subtitulo}>
                        Diga o que você procura e a IA encontra a melhor quadra e horário
                    </Text>

                    <TextInput
                        value={pedido}
                        onChangeText={setPedido}
                        placeholder="Ex: quero jogar futsal depois das 20h, até R$ 100"
                        placeholderTextColor="#888"
                        multiline
                        style={[globalStyles.input, styles.campoPedido]}
                    />

                    <TouchableOpacity
                        style={[globalStyles.botao, carregando && styles.botaoDesativado]}
                        onPress={pedirSugestao}
                        disabled={carregando}
                    >
                        <Text style={globalStyles.textoBotao}>
                            {carregando ? 'Buscando...' : 'Encontrar horário'}
                        </Text>
                    </TouchableOpacity>

                    {carregando && <ActivityIndicator size="large" color="#22c55e" style={styles.loading} />}

                    {sugestao && (
                        <View style={styles.card}>
                            <Text style={styles.rotulo}>Sugestão da IA</Text>
                            <Text style={styles.nome}>{sugestao.quadra.nome}</Text>
                            <Text style={styles.esporte}>{sugestao.quadra.esporte}</Text>
                            <Text style={styles.info}>
                                Hoje às {sugestao.horario} - R$ {sugestao.quadra.precoHora.toFixed(2)}
                            </Text>
                            <Text style={styles.motivo}>{sugestao.motivo}</Text>

                            <TouchableOpacity style={styles.botaoReservar} onPress={() => setConfirmando(true)}>
                                <Text style={styles.textoReservar}>Reservar</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {mensagem !== '' && <Text style={styles.mensagem}>{mensagem}</Text>}
                </View>
            </ScrollView>

            <ModalConfirmacao
                visivel={confirmando && sugestao !== null}
                titulo="Confirmar reserva"
                mensagem={
                    sugestao
                        ? `${sugestao.quadra.nome} (${sugestao.quadra.esporte})\nHoje às ${sugestao.horario} - R$ ${sugestao.quadra.precoHora.toFixed(2)}`
                        : ''
                }
                textoConfirmar="Reservar"
                onConfirmar={confirmarReserva}
                onCancelar={() => setConfirmando(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flexGrow: 1,
    },
    campoPedido: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    botaoDesativado: {
        opacity: 0.6,
    },
    loading: {
        marginTop: 20,
    },
    card: {
        backgroundColor: '#1b1b1b',
        borderWidth: 1,
        borderColor: '#22c55e',
        borderRadius: 10,
        padding: 16,
        marginTop: 20,
    },
    rotulo: {
        color: '#aaa',
        fontSize: 12,
        textTransform: 'uppercase',
        marginBottom: 6,
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
    motivo: {
        color: '#ccc',
        fontSize: 14,
        fontStyle: 'italic',
        marginTop: 8,
    },
    botaoReservar: {
        alignSelf: 'flex-start',
        backgroundColor: '#22c55e',
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 20,
        marginTop: 14,
    },
    textoReservar: {
        color: '#121212',
        fontSize: 15,
        fontWeight: 'bold',
    },
    mensagem: {
        color: '#aaa',
        fontSize: 15,
        textAlign: 'center',
        marginTop: 20,
    },
});
