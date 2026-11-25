import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Quadra } from '../types/Quadra';
import { Reserva } from '../types/Reservas';
import { horarioJaPassou, horarioOcupado } from '../utils/reservas';

type Props = {
    quadra: Quadra;
    reservas: Reserva[];
    onEscolherHorario: (quadra: Quadra, horario: string) => void;
};

// Esse componente é um CARD de uma quadra, com os horários do dia
export function CardQuadra({ quadra, reservas, onEscolherHorario }: Props) {
    return (
        <View style={styles.card}>
            <Text style={styles.nome}>{quadra.nome}</Text>
            <Text style={styles.esporte}>{quadra.esporte}</Text>
            <Text style={styles.preco}>R$ {quadra.precoHora.toFixed(2)} / hora</Text>

            <View style={styles.listaHorarios}>
                {quadra.horarios.map((horario) => {
                    // horário bloqueado se já passou ou se já foi reservado
                    const indisponivel =
                        horarioJaPassou(horario) || horarioOcupado(reservas, quadra.id, horario);

                    return (
                        <TouchableOpacity
                            key={horario}
                            style={[styles.horario, indisponivel && styles.horarioIndisponivel]}
                            disabled={indisponivel}
                            onPress={() => onEscolherHorario(quadra, horario)}
                        >
                            <Text style={[styles.textoHorario, indisponivel && styles.textoIndisponivel]}>
                                {horario}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
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
