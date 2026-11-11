import { Reserva } from '../types/Reservas';

export function dataHoje(): string {
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${hoje.getFullYear()}-${mes}-${dia}`;
}

export function horarioJaPassou(horario: string): boolean {
    const hora = Number(horario.split(':')[0]);
    return hora <= new Date().getHours();
}

export function reservaAtiva(reserva: Reserva): boolean {
    if (reserva.data > dataHoje()) {
        return true;
    }
    return reserva.data === dataHoje() && !horarioJaPassou(reserva.horario);
}

export function formatarData(data: string): string {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}
