import { ESTADOS } from '../models/estadosSenha.js';

/**
 * RN02/RN03/RN04 - Regra de priorização  [SP] -> [SE|SG] -> [SP] -> [SE|SG]
 *
 * - Se a última senha chamada foi SP, a próxima deve ser SE (se houver),
 *   senão SG (se houver) e, só se as duas estiverem vazias, outra SP.
 * - Se a última NÃO foi SP (ou é a primeira do dia), a próxima é SP (se houver),
 *   senão SE, senão SG.
 * - Dentro do mesmo tipo vale a ordem de chegada (FIFO).
 */
export function definirOrdemDeTipos(ultimoTipoChamado) {
  return ultimoTipoChamado === 'SP' ? ['SE', 'SG', 'SP'] : ['SP', 'SE', 'SG'];
}

export function escolherProximaSenha(senhas, ultimoTipoChamado) {
  const aguardando = senhas
    .filter((s) => s.estado === ESTADOS.AGUARDANDO)
    .sort((a, b) => new Date(a.emitidaEm) - new Date(b.emitidaEm) || a.id - b.id);

  for (const tipo of definirOrdemDeTipos(ultimoTipoChamado)) {
    const encontrada = aguardando.find((s) => s.tipo === tipo);
    if (encontrada) return encontrada;
  }
  return null; // fila vazia
}
