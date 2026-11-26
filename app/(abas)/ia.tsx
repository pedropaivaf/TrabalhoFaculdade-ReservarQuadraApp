import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { globalStyles } from '../../styles/global';
import { Quadra } from '../../src/types/Quadra';
import { Reserva } from '../../src/types/Reservas';
import { Usuario } from '../../src/types/Usuario';
import { dataHoje, horariosLivres, reservaAtiva } from '../../src/utils/reservas';
import { ModalConfirmacao } from '../../src/components/ModalConfirmacao';
import { reservaEvents } from '../../src/events/reservaEvent';
import dadosQuadras from '../../src/types/data/quadras.json';

const quadras: Quadra[] = dadosQuadras;
const CHAVE_LOGADO = 'usuario_logado';
const CHAVE_RESERVAS = 'reservas';

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
// Se o primeiro modelo estiver sobrecarregado, o app tenta o próximo da lista
const MODELOS_GEMINI = ['gemini-3.1-flash-lite', 'gemini-3.5-flash'];

// Formato que a IA é obrigada a seguir: UMA quadra, UM horário e o motivo
const FORMATO_RESPOSTA = {
    type: 'OBJECT',
    properties: {
        quadraId: { type: 'STRING', nullable: true },
        horario: { type: 'STRING', nullable: true },
        motivo: { type: 'STRING' },
    },
    required: ['quadraId', 'horario', 'motivo'],
};

function urlGemini(modelo: string): string {
    return `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`;
}

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
            .filter((q) => horariosLivres(q, reservas).length > 0)
            .map((q) => `id ${q.id} | ${q.nome} | ${q.esporte} | R$ ${q.precoHora}/hora | livres: ${horariosLivres(q, reservas).join(', ')}`);

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
            'Escolha UMA única opção, a que melhor atende o pedido, usando somente os horários livres acima. ' +
            'Se o pedido não disser o esporte, escolha a opção mais barata. ' +
            'Se o horário pedido não estiver livre, sugira o horário livre mais próximo e explique no motivo. ' +
            'O campo quadraId é o id da quadra e o horario fica no formato HH:MM. ' +
            'O motivo é uma frase curta em português explicando a escolha, sem dizer que a reserva foi feita. ' +
            'Se nenhuma opção atender, use quadraId e horario como null e explique o motivo.';

        setCarregando(true);
        setSugestao(null);
        setMensagem('');

        consultarIA(prompt, 0);
    };

    const consultarIA = (prompt: string, indiceModelo: number) => {
        let tentandoOutroModelo = false;

        // se a IA não responder em 15 segundos, cancela a requisição
        const controle = new AbortController();
        const tempoLimite = setTimeout(() => controle.abort(), 15000);

        fetch(urlGemini(MODELOS_GEMINI[indiceModelo]), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': API_KEY || '',
            },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: 'application/json',
                    responseSchema: FORMATO_RESPOSTA,
                },
            }),
            signal: controle.signal,
        })
            .then((resposta) => resposta.json())
            .then((data) => {
                // a API respondeu com erro (ex: modelo sobrecarregado)
                if (data.error) {
                    throw new Error(data.error.message);
                }

                const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                const resposta = JSON.parse(texto);

                // garante que vamos usar só uma opção, mesmo se vier uma lista
                const resultado = Array.isArray(resposta) ? resposta[0] : resposta;

                const quadra = quadras.find((q) => q.id === String(resultado.quadraId));

                if (quadra && horariosLivres(quadra, reservas).includes(resultado.horario)) {
                    setSugestao({ quadra, horario: resultado.horario, motivo: resultado.motivo });
                } else {
                    setMensagem(resultado.motivo || 'Nenhuma opção encontrada para o seu pedido.');
                }
            })
            .catch((erro) => {
                console.log('Erro:', erro);

                // falhou ou demorou demais: tenta o próximo modelo da lista
                if (indiceModelo + 1 < MODELOS_GEMINI.length) {
                    tentandoOutroModelo = true;
                    consultarIA(prompt, indiceModelo + 1);
                    return;
                }

                setMensagem('A IA está indisponível no momento. Tente novamente em instantes.');
            })
            .finally(() => {
                clearTimeout(tempoLimite);
                if (!tentandoOutroModelo) {
                    setCarregando(false);
                }
            });
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
                reservaEvents.emit('reservas:changed'); // notifica que as reservas mudaram
            })
            .catch((err) => {
                console.log(err);
                alert('Erro ao fazer reserva.');
            });
    };

    return (
        <SafeAreaView style={globalStyles.container} edges={['top']}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
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
