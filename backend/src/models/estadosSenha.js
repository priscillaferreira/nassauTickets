import { ErroNegocio } from '../utils/erros.js';

/**
 * Máquina de estados da senha (RN12).
 *
 * EMITIDA -> AGUARDANDO -> CHAMADA -> CHAMADA_NOVAMENTE -> EM_ATENDIMENTO -> ATENDIDA
 *                              \______________________________/
 *                    (o cliente pode comparecer já na 1ª chamada)
 * CHAMADA_NOVAMENTE -> NAO_COMPARECEU (após 2 chamadas sem comparecimento)
 * AGUARDANDO        -> NAO_COMPARECEU (descarte no fim do expediente)
 */
export const ESTADOS = Object.freeze({
  EMITIDA: 'EMITIDA',
  AGUARDANDO: 'AGUARDANDO',
  CHAMADA: 'CHAMADA',
  CHAMADA_NOVAMENTE: 'CHAMADA_NOVAMENTE',
  EM_ATENDIMENTO: 'EM_ATENDIMENTO',
  ATENDIDA: 'ATENDIDA',
  NAO_COMPARECEU: 'NAO_COMPARECEU',
});

const TRANSICOES = Object.freeze({
  EMITIDA: ['AGUARDANDO'],
  AGUARDANDO: ['CHAMADA', 'NAO_COMPARECEU'],
  CHAMADA: ['CHAMADA_NOVAMENTE', 'EM_ATENDIMENTO'],
  CHAMADA_NOVAMENTE: ['EM_ATENDIMENTO', 'NAO_COMPARECEU'],
  EM_ATENDIMENTO: ['ATENDIDA'],
  ATENDIDA: [],
  NAO_COMPARECEU: [],
});

/** Estados em que a senha está "ocupando" um guichê. */
export const ESTADOS_ATIVOS_NO_GUICHE = [
  ESTADOS.CHAMADA,
  ESTADOS.CHAMADA_NOVAMENTE,
  ESTADOS.EM_ATENDIMENTO,
];

export function podeTransicionar(de, para) {
  return (TRANSICOES[de] || []).includes(para);
}

/**
 * Altera o estado da senha validando a transição e guardando o histórico.
 */
export function transicionar(senha, novoEstado, agora = new Date()) {
  if (!podeTransicionar(senha.estado, novoEstado)) {
    throw new ErroNegocio(
      `Transição inválida: ${senha.estado} -> ${novoEstado} (senha ${senha.numero})`,
      409,
    );
  }
  senha.estado = novoEstado;
  senha.historico.push({ estado: novoEstado, em: agora.toISOString() });
  return senha;
}
