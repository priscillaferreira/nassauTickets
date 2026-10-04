import { config } from '../config/config.js';
import { db } from '../data/memoryDb.js';
import { ESTADOS, transicionar } from '../models/estadosSenha.js';
import { ErroNegocio } from '../utils/erros.js';

/** RN09 - Expediente das 7h às 17h. */
export function dentroDoExpediente(agora = new Date(), opcoes = config) {
  if (opcoes.ignorarExpediente) return true;
  const hora = agora.getHours() + agora.getMinutes() / 60;
  return hora >= opcoes.expedienteInicio && hora < opcoes.expedienteFim;
}

export function exigirExpediente(agora = new Date(), opcoes = config) {
  if (!dentroDoExpediente(agora, opcoes)) {
    throw new ErroNegocio(
      `Fora do expediente (${opcoes.expedienteInicio}h às ${opcoes.expedienteFim}h).`,
      403,
    );
  }
}

/**
 * RN10 - Ao fim do expediente, senhas que ainda estão na fila são descartadas.
 * Atendimentos em andamento NÃO são afetados: o atendente deve finalizá-los.
 */
export function encerrarExpediente(agora = new Date()) {
  const descartadas = [];
  for (const senha of db.senhas) {
    if (senha.estado === ESTADOS.AGUARDANDO) {
      transicionar(senha, ESTADOS.NAO_COMPARECEU, agora);
      senha.motivoEncerramento = 'DESCARTADA_FIM_EXPEDIENTE';
      descartadas.push(senha.numero);
    }
  }
  return { quantidadeDescartada: descartadas.length, descartadas };
}
