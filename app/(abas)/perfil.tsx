import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { globalStyles } from '../../styles/global';
import { Usuario } from '../../src/types/Usuario';

const CHAVE_LOGADO = 'usuario_logado';

export default function PerfilScreen() {
    const [usuario, setUsuario] = useState<Usuario | null>(null);

    useEffect(() => {
        AsyncStorage.getItem(CHAVE_LOGADO)
            .then((res) => {
                if (res) {
                    setUsuario(JSON.parse(res));
                }
            })
            .catch((err) => console.log(err));
    }, []);

    const sair = () => {
        AsyncStorage.removeItem(CHAVE_LOGADO)
            .then(() => {
                router.replace('/');
            })
            .catch((err) => console.log(err));
    };

    return (
        <SafeAreaView style={globalStyles.container} edges={['top']}>
            <View style={globalStyles.content}>
                <Text style={globalStyles.titulo}>Meu Perfil</Text>
                <Text style={globalStyles.subtitulo}>
                    Olá, {usuario ? usuario.nome : 'visitante'}!
                </Text>

                {usuario && (
                    <Text style={[globalStyles.texto, styles.email]}>{usuario.email}</Text>
                )}

                <TouchableOpacity style={[globalStyles.botao, styles.botaoSair]} onPress={sair}>
                    <Text style={styles.textoSair}>Sair</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    email: {
        textAlign: 'center',
        color: '#aaa',
        marginBottom: 24,
    },
    botaoSair: {
        backgroundColor: '#ef4444',
        width: 'auto',
        alignSelf: 'center',
        paddingVertical: 10,
        paddingHorizontal: 32,
    },
    textoSair: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});