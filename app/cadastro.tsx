import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { globalStyles } from '../styles/global';
import { Usuario } from '../src/types/Usuario';

const CHAVE_USUARIOS = 'usuarios_cadastrados';

export default function CadastroScreen() {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');

    const cadastrarUsuario = () => {
        if (!nome.trim() || !email.trim() || !senha.trim()) {
            alert('Preencha todos os campos!');
            return;
        }

        AsyncStorage.getItem(CHAVE_USUARIOS)
            .then((res) => {
                const usuarios: Usuario[] = res ? JSON.parse(res) : [];

                const repetidos = usuarios.filter((u) => u.email === email.trim());
                if (repetidos.length > 0) {
                    alert('Este e-mail já está cadastrado!');
                    return;
                }

                const novoUsuario: Usuario = {
                    id: String(Date.now()),
                    nome: nome.trim(),
                    email: email.trim(),
                    senha: senha,
                };

                const listaAtualizada = [...usuarios, novoUsuario];

                AsyncStorage.setItem(CHAVE_USUARIOS, JSON.stringify(listaAtualizada))
                    .then(() => {
                        alert('Cadastro realizado com sucesso!');
                        router.push('/');
                    });
            })
            .catch((err) => {
                console.log(err);
                alert('Erro ao salvar cadastro.');
            });
    };

    return (
        <SafeAreaView style={globalStyles.container}>
            <View style={[globalStyles.content, styles.centralizado]}>
                <Text style={globalStyles.titulo}>Criar Conta</Text>
                <Text style={globalStyles.subtitulo}>
                    Cadastre-se para reservar sua quadra
                </Text>

                <TextInput
                    value={nome}
                    onChangeText={setNome}
                    placeholder="Seu nome"
                    placeholderTextColor="#888"
                    style={globalStyles.input}
                />

                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Seu e-mail"
                    placeholderTextColor="#888"
                    autoCapitalize="none"
                    style={globalStyles.input}
                />

                <TextInput
                    value={senha}
                    onChangeText={setSenha}
                    placeholder="Crie uma senha"
                    placeholderTextColor="#888"
                    secureTextEntry
                    style={globalStyles.input}
                />

                <TouchableOpacity style={globalStyles.botao} onPress={cadastrarUsuario}>
                    <Text style={globalStyles.textoBotao}>Cadastrar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.linkVoltar} onPress={() => router.push('/')}>
                    <Text style={styles.textoLink}>Já tem conta? Faça login</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    centralizado: {
        justifyContent: 'center',
    },
    linkVoltar: {
        marginTop: 18,
        alignItems: 'center',
    },
    textoLink: {
        color: '#22c55e',
        fontSize: 15,
    },
});