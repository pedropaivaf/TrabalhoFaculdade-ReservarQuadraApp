import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
    visivel: boolean;
    titulo: string;
    mensagem: string;
    textoConfirmar: string;
    corConfirmar?: string;
    onConfirmar: () => void;
    onCancelar: () => void;
};

export function ModalConfirmacao({
    visivel,
    titulo,
    mensagem,
    textoConfirmar,
    corConfirmar = '#22c55e',
    onConfirmar,
    onCancelar,
}: Props) {
    return (
        <Modal
            visible={visivel}
            transparent
            animationType="fade"
            onRequestClose={onCancelar}
        >
            <View style={styles.fundo}>
                <View style={styles.caixa}>
                    <Text style={styles.titulo}>{titulo}</Text>
                    <Text style={styles.mensagem}>{mensagem}</Text>

                    <View style={styles.botoes}>
                        <TouchableOpacity style={[styles.botao, styles.botaoVoltar]} onPress={onCancelar}>
                            <Text style={styles.textoBotao}>Voltar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.botao, { backgroundColor: corConfirmar }]}
                            onPress={onConfirmar}
                        >
                            <Text style={styles.textoBotao}>{textoConfirmar}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    fundo: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    caixa: {
        backgroundColor: '#1b1b1b',
        borderWidth: 1,
        borderColor: '#2a2a2a',
        borderRadius: 12,
        padding: 20,
        width: '100%',
        maxWidth: 400,
    },
    titulo: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    mensagem: {
        color: '#ccc',
        fontSize: 16,
        marginBottom: 20,
    },
    botoes: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    botao: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    botaoVoltar: {
        borderWidth: 1,
        borderColor: '#444',
    },
    textoBotao: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
    },
});
