import { db, novoId } from '../data/memoryDb.js';
import { ESTADOS, transicionar } from '../models/estadosSenha.js';
import { TIPOS_SENHA, tipoValido } from '../models/tiposSenha.js';
import { prefixoData } from '../utils/datas.js';
import { ErroNegocio } from '../utils/erros.js';
import { exigirExpediente } from './expedienteService.js';

/**
 * RN05 - Numeração YYMMDD-PPSQ.
 * SQ tem 3 dígitos, é sequencial POR TIPO e reinicia todo dia
 * (a chave inclui a data, então um novo dia começa do 001 automaticamente).
 */
export function gerarNumeroSenha(tipo, data = new Date()) {
  const prefixo = prefixoData(data);
  const chave = `${prefixo}-${tipo}`;
  const sequencia = (db.sequencias[chave] || 0) + 1;
  if (sequencia > 999) {
    throw new ErroNegocio(`Limite diário de 999 senhas ${tipo} atingido.`, 409);
  }
  db.sequencias[chave] = sequencia;
  return `${prefixo}-${tipo}${String(sequencia).padStart(3, '0')}`;
}

/**
 * RF01 - Emissão de senha pelo totem (cliente anônimo - LGPD).
 */
export function emitirSenha(tipo, agora = new Date(), { validarExpediente = true } = {}) {
  if (!tipoValido(tipo)) {
    throw new ErroNegocio('Tipo de senha inválido. Use SP, SE ou SG.', 400);
  }
  if (validarExpediente) exigirExpediente(agora);

  const senha = {
    id: novoId(),
    numero: gerarNumeroSenha(tipo, agora),
    tipo,
    nomeTipo: TIPOS_SENHA[tipo].nome,
    estado: ESTADOS.EMITIDA,
    emitidaEm: agora.toISOString(),
    guiche: null,
    atendenteId: null,
    atendenteNome: null,
    primeiraChamadaEm: null,
    segundaChamadaEm: null,
    inicioAtendimentoEm: null,
    fimAtendimentoEm: null,
    motivoEncerramento: null,
    historico: [{ estado: ESTADOS.EMITIDA, em: agora.toISOString() }],
  };

  // A senha é impressa e entra imediatamente na fila.
  transicionar(senha, ESTADOS.AGUARDANDO, agora);
  db.senhas.push(senha);
  return senha;
}

export function buscarSenhaPorId(id) {
  const senha = db.senhas.find((s) => s.id === Number(id));
  if (!senha) throw new ErroNegocio('Senha não encontrada.', 404);
  return senha;
}

/** Resumo da fila: apenas QUANTIDADES (RN11 - a próxima senha não é revelada). */
export function resumoFila() {
  const aguardando = db.senhas.filter((s) => s.estado === ESTADOS.AGUARDANDO);
  return {
    total: aguardando.length,
    SP: aguardando.filter((s) => s.tipo === 'SP').length,
    SE: aguardando.filter((s) => s.tipo === 'SE').length,
    SG: aguardando.filter((s) => s.tipo === 'SG').length,
  };
}
