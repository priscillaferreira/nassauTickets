import { db } from '../data/memoryDb.js';
import { ESTADOS } from '../models/estadosSenha.js';
import { CODIGOS_TIPO, TIPOS_SENHA } from '../models/tiposSenha.js';
import { arredondar, dataISO, minutosEntre } from '../utils/datas.js';
import { ErroNegocio } from '../utils/erros.js';

const media = (valores) => {
  const validos = valores.filter((v) => v !== null && v !== undefined);
  if (validos.length === 0) return null;
  return arredondar(validos.reduce((a, b) => a + b, 0) / validos.length);
};

function filtrarPeriodo(tipo, referencia) {
  if (tipo === 'diario') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(referencia || '')) {
      throw new ErroNegocio('Informe a data no formato AAAA-MM-DD.', 400);
    }
    return db.senhas.filter((s) => dataISO(new Date(s.emitidaEm)) === referencia);
  }
  if (tipo === 'mensal') {
    if (!/^\d{4}-\d{2}$/.test(referencia || '')) {
      throw new ErroNegocio('Informe o mês no formato AAAA-MM.', 400);
    }
    return db.senhas.filter((s) => dataISO(new Date(s.emitidaEm)).startsWith(referencia));
  }
  throw new ErroNegocio('Tipo de relatório inválido. Use "diario" ou "mensal".', 400);
}

const foiAtendida = (s) => s.estado === ESTADOS.ATENDIDA;
const duracao = (s) => minutosEntre(s.inicioAtendimentoEm, s.fimAtendimentoEm);
const espera = (s) => minutosEntre(s.emitidaEm, s.primeiraChamadaEm);

/**
 * RF13 - Relatórios diário e mensal (quantitativos, detalhado, TM e auditoria)
 * + proposta de acompanhamento de desempenho.
 */
export function gerarRelatorio({ tipo, referencia }) {
  const senhas = filtrarPeriodo(tipo, referencia);
  const atendidas = senhas.filter(foiAtendida);

  const porTipo = CODIGOS_TIPO.map((codigo) => {
    const doTipo = senhas.filter((s) => s.tipo === codigo);
    const atendidasDoTipo = doTipo.filter(foiAtendida);
    return {
      tipo: codigo,
      nome: TIPOS_SENHA[codigo].nome,
      emitidas: doTipo.length,
      atendidas: atendidasDoTipo.length,
      naoAtendidas: doTipo.length - atendidasDoTipo.length,
      tmReferenciaMin: TIPOS_SENHA[codigo].tmBase,
      tmRealMin: media(atendidasDoTipo.map(duracao)),
      esperaMediaMin: media(doTipo.map(espera)),
    };
  });

  // Relatório detalhado: campos de atendimento em branco quando não atendida.
  const detalhado = [...senhas]
    .sort((a, b) => new Date(a.emitidaEm) - new Date(b.emitidaEm))
    .map((s) => ({
      numero: s.numero,
      tipo: s.tipo,
      emitidaEm: s.emitidaEm,
      atendidaEm: foiAtendida(s) ? s.inicioAtendimentoEm : null,
      guiche: foiAtendida(s) ? s.guiche : null,
      estado: s.estado,
    }));

  // Auditoria: toda senha que chegou a ser chamada.
  const auditoria = senhas
    .filter((s) => s.primeiraChamadaEm)
    .sort((a, b) => new Date(a.primeiraChamadaEm) - new Date(b.primeiraChamadaEm))
    .map((s) => ({
      atendente: s.atendenteNome,
      guiche: s.guiche,
      senha: s.numero,
      primeiraChamadaEm: s.primeiraChamadaEm,
      segundaChamadaEm: s.segundaChamadaEm,
      inicioAtendimentoEm: s.inicioAtendimentoEm,
      fimAtendimentoEm: s.fimAtendimentoEm,
      estado: s.estado,
    }));

  // Proposta de desempenho: indicadores por atendente.
  const porAtendente = new Map();
  for (const s of senhas.filter((x) => x.atendenteNome)) {
    if (!porAtendente.has(s.atendenteNome)) porAtendente.set(s.atendenteNome, []);
    porAtendente.get(s.atendenteNome).push(s);
  }
  const desempenho = [...porAtendente.entries()].map(([atendente, lista]) => {
    const ok = lista.filter(foiAtendida);
    return {
      atendente,
      chamadas: lista.length,
      atendimentos: ok.length,
      naoComparecimentos: lista.filter((s) => s.estado === ESTADOS.NAO_COMPARECEU).length,
      tmMin: media(ok.map(duracao)),
      tempoTotalMin: arredondar(ok.reduce((t, s) => t + (duracao(s) || 0), 0)),
    };
  });

  return {
    tipo,
    referencia,
    geradoEm: new Date().toISOString(),
    totais: {
      emitidas: senhas.length,
      atendidas: atendidas.length,
      naoAtendidas: senhas.length - atendidas.length,
      taxaAtendimentoPercent: senhas.length
        ? arredondar((atendidas.length / senhas.length) * 100, 1)
        : 0,
      tmGeralMin: media(atendidas.map(duracao)),
      esperaMediaMin: media(senhas.map(espera)),
    },
    porTipo,
    detalhado,
    auditoria,
    desempenho,
  };
}
