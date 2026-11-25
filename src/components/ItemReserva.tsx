import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Reserva } from '../types/Reservas';
import { formatarData, reservaAtiva } from '../utils/reservas';

type Props = {
    reserva: Reserva;
    onCancelar: (reserva: Reserva) => void;
};

// Esse componente é um CARD de uma reserva do usuário
export function ItemReserva({ reserva, onCancelar }: Props) {
    return (
        <View style={styles.card}>
            <Text style={styles.nome}>{reserva.quadraNome}</Text>
            <Text style={styles.esporte}>{reserva.esporte}</Text>
            <Text style={styles.info}>
                {formatarData(reserva.data)} às {reserva.horario}
            </Text>

            {/* só reservas que ainda não passaram podem ser canceladas */}
            {reservaAtiva(reserva) ? (
                <TouchableOpacity style={styles.botaoCancelar} onPress={() => onCancelar(reserva)}>
                    <Text style={styles.textoCancelar}>Cancelar</Text>
                </TouchableOpacity>
            ) : (
                <Text style={styles.concluida}>Concluída</Text>
            )}
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
    info: {
        color: '#fff',
        fontSize: 16,
        marginTop: 8,
    },
    botaoCancelar: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: '#ef4444',
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 14,
        marginTop: 12,
    },
    textoCancelar: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: 'bold',
    },
    concluida: {
        color: '#555',
        fontSize: 14,
        marginTop: 12,
    },
});
