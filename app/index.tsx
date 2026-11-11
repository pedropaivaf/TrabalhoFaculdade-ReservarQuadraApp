import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { globalStyles } from '../styles/global';
import { Usuario } from '../src/types/Usuario';

const CHAVE_USUARIOS = 'usuarios_cadastrados';
const CHAVE_LOGADO = 'usuario_logado';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const fazerLogin = () => {
        if (!email.trim() || !senha.trim()) {
            alert('Preencha e-mail e senha!');
            return;
        }

        AsyncStorage.getItem(CHAVE_USUARIOS)
            .then((res) => {
                const usuarios: Usuario[] = res ? JSON.parse(res) : [];

                const usuario = usuarios.find(
                    (u) => u.email === email.trim() && u.senha === senha
                );

                if (!usuario) {
                    alert('E-mail ou senha inválidos!');
                    return;
                }

                AsyncStorage.setItem(CHAVE_LOGADO, JSON.stringify(usuario))
                    .then(() => {
                        router.replace('/quadras');
                    });
            })
            .catch((err) => {
                console.log(err);
                alert('Erro ao fazer login.');
            });
    };

    return (
        <SafeAreaView style={globalStyles.container}>
            <View style={[globalStyles.content, styles.centralizado]}>
                <Text style={globalStyles.titulo}>Entrar</Text>
                <Text style={globalStyles.subtitulo}>
                    Acesse sua conta para reservar quadras
                </Text>

                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Seu e-mail"
                    placeholderTextColor="#888"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={globalStyles.input}
                />

                <TextInput
                    value={senha}
                    onChangeText={setSenha}
                    placeholder="Sua senha"
                    placeholderTextColor="#888"
                    secureTextEntry
                    style={globalStyles.input}
                />

                <TouchableOpacity style={globalStyles.botao} onPress={fazerLogin}>
                    <Text style={globalStyles.textoBotao}>Entrar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.linkCadastro} onPress={() => router.push('/cadastro')}>
                    <Text style={styles.textoLink}>Não tem conta? Cadastre-se</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    centralizado: {
        justifyContent: 'center',
    },
    linkCadastro: {
        marginTop: 18,
        alignItems: 'center',
    },
    textoLink: {
        color: '#22c55e',
        fontSize: 15,
    },
});