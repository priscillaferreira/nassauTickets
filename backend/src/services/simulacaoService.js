import { db } from '../data/memoryDb.js';
import { ESTADOS, transicionar } from '../models/estadosSenha.js';
import { ErroNegocio } from '../utils/erros.js';
import { escolherProximaSenha } from './filaService.js';
import { emitirSenha } from './senhaService.js';

/**
 * RN08 - Sorteio do Tempo de Atendimento (em minutos):
 *  - SP: 15 min, variando até 5 min para mais ou para menos (distribuição uniforme)
 *  - SG: 5 min, variando até 3 min para mais ou para menos (distribuição uniforme)
 *  - SE: 1 min em 95% dos casos e 5 min em 5% dos casos
 */
export function sortearTempoAtendimento(tipo, aleatorio = Math.random) {
  if (tipo === 'SP') return 15 + (aleatorio() * 10 - 5);
  if (tipo === 'SG') return 5 + (aleatorio() * 6 - 3);
  if (tipo === 'SE') return aleatorio() < 0.95 ? 1 : 5;
  throw new ErroNegocio('Tipo inválido.', 400);
}

/** Distribuição de chegada adotada para a simulação (premissa do grupo). */
function sortearTipo(aleatorio) {
  const r = aleatorio();
  if (r < 0.2) return 'SP';
  if (r < 0.45) return 'SE';
  return 'SG';
}

const somarMinutos = (data, minutos) => new Date(data.getTime() + minutos * 60000);

/**
 * Simula um dia inteiro de atendimento (7h às 17h) para gerar dados de
 * relatório. Aplica as mesmas regras do sistema real, incluindo os 5% de
 * senhas não atendidas (RN07).
 */
export function simularDia({ data, quantidade = 150, aleatorio = Math.random }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data || '')) {
    throw new ErroNegocio('Informe a data no formato AAAA-MM-DD.', 400);
  }
  const [ano, mes, dia] = data.split('-').map(Number);
  const inicio = new Date(ano, mes - 1, dia, 7, 0, 0);
  const fim = new Date(ano, mes - 1, dia, 17, 0, 0);
  const janelaMin = (fim - inicio) / 60000 - 15; // chegadas até 16h45

  const atendentes = db.usuarios.filter((u) => u.perfis.includes('ATENDENTE')).slice(0, 3);
  if (atendentes.length === 0) throw new ErroNegocio('Nenhum atendente cadastrado.', 409);

  // 1) Emissão das senhas em horários aleatórios
  const chegadas = Array.from({ length: quantidade }, () => ({
    em: somarMinutos(inicio, aleatorio() * janelaMin),
    tipo: sortearTipo(aleatorio),
  })).sort((a, b) => a.em - b.em);
  const senhas = chegadas.map((c) => emitirSenha(c.tipo, c.em, { validarExpediente: false }));

  // 2) Guichês atendendo em paralelo
  const guiches = atendentes.map((u, i) => ({ guiche: i + 1, usuario: u, livreEm: inicio }));
  let ultimoTipo = null;

  while (true) {
    guiches.sort((a, b) => a.livreEm - b.livreEm);
    const g = guiches[0];
    const t = g.livreEm;
    if (t >= fim) break;

    const disponiveis = senhas.filter(
      (s) => s.estado === ESTADOS.AGUARDANDO && new Date(s.emitidaEm) <= t,
    );
    if (disponiveis.length === 0) {
      const proxima = senhas.find(
        (s) => s.estado === ESTADOS.AGUARDANDO && new Date(s.emitidaEm) > t,
      );
      if (!proxima) break;
      g.livreEm = new Date(proxima.emitidaEm);
      continue;
    }

    const senha = escolherProximaSenha(disponiveis, ultimoTipo);
    ultimoTipo = senha.tipo;
    transicionar(senha, ESTADOS.CHAMADA, t);
    Object.assign(senha, {
      guiche: g.guiche,
      atendenteId: g.usuario.id,
      atendenteNome: g.usuario.nome,
      primeiraChamadaEm: t.toISOString(),
    });

    if (aleatorio() < 0.05) {
      // Não compareceu: 2ª chamada após 1 min e abandono após mais 1 min
      const t2 = somarMinutos(t, 1);
      transicionar(senha, ESTADOS.CHAMADA_NOVAMENTE, t2);
      senha.segundaChamadaEm = t2.toISOString();
      const t3 = somarMinutos(t2, 1);
      transicionar(senha, ESTADOS.NAO_COMPARECEU, t3);
      senha.motivoEncerramento = 'NAO_COMPARECEU_APOS_2_CHAMADAS';
      g.livreEm = t3;
      continue;
    }

    const inicioAtd = somarMinutos(t, 0.5); // deslocamento até o guichê
    const fimAtd = somarMinutos(inicioAtd, sortearTempoAtendimento(senha.tipo, aleatorio));
    transicionar(senha, ESTADOS.EM_ATENDIMENTO, inicioAtd);
    senha.inicioAtendimentoEm = inicioAtd.toISOString();
    transicionar(senha, ESTADOS.ATENDIDA, fimAtd);
    senha.fimAtendimentoEm = fimAtd.toISOString();
    g.livreEm = fimAtd; // atendimento iniciado é sempre concluído
  }

  // 3) RN10 - Fim do expediente: descarta quem ficou na fila
  let descartadas = 0;
  for (const s of senhas) {
    if (s.estado === ESTADOS.AGUARDANDO) {
      transicionar(s, ESTADOS.NAO_COMPARECEU, fim);
      s.motivoEncerramento = 'DESCARTADA_FIM_EXPEDIENTE';
      descartadas++;
    }
  }

  return {
    data,
    emitidas: senhas.length,
    atendidas: senhas.filter((s) => s.estado === ESTADOS.ATENDIDA).length,
    descartadasFimExpediente: descartadas,
    totalNoBanco: db.senhas.length,
  };
}
