import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 20,
    },
    content: {
        flex: 1,
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
    },
    titulo: {
        color: '#22c55e',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },

       tituloDicas: {
        color: '#22c55e',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },

    subtitulo: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 16,
    },
    texto: {
        color: '#fff',
        fontSize: 16,
    },
    input: {
        backgroundColor: '#1b1b1b',
        color: '#fff',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 12,
        width: '100%',
    },
    botao: {
        backgroundColor: '#22c55e',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
        marginTop: 4,
    },
    textoBotao: {
        color: '#121212',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
