import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';
import { db, popularUsuariosIniciais, resetarBanco } from '../src/data/memoryDb.js';
import { ESTADOS, podeTransicionar } from '../src/models/estadosSenha.js';
import {
  chamarNovamente,
  chamarProxima,
  finalizarAtendimento,
  iniciarAtendimento,
  registrarNaoComparecimento,
} from '../src/services/atendimentoService.js';
import { dentroDoExpediente, encerrarExpediente } from '../src/services/expedienteService.js';
import { escolherProximaSenha } from '../src/services/filaService.js';
import { gerarRelatorio } from '../src/services/relatorioService.js';
import { emitirSenha, gerarNumeroSenha } from '../src/services/senhaService.js';
import { simularDia, sortearTempoAtendimento } from '../src/services/simulacaoService.js';

const usuario = { id: 1, nome: 'Teste' };
const hoje = new Date(2026, 8, 30, 9, 0, 0); // 30/09/2026 09:00

beforeEach(() => {
  resetarBanco();
  popularUsuariosIniciais();
});

describe('RN05 - Numeração YYMMDD-PPSQ', () => {
  test('gera número no formato correto', () => {
    assert.equal(gerarNumeroSenha('SP', hoje), '260930-SP001');
    assert.equal(gerarNumeroSenha('SP', hoje), '260930-SP002');
  });
  test('sequência é independente por tipo', () => {
    gerarNumeroSenha('SP', hoje);
    assert.equal(gerarNumeroSenha('SG', hoje), '260930-SG001');
  });
  test('sequência reinicia no dia seguinte', () => {
    gerarNumeroSenha('SE', hoje);
    assert.equal(gerarNumeroSenha('SE', new Date(2026, 9, 1, 8)), '261001-SE001');
  });
});

describe('RF01 - Emissão', () => {
  test('senha emitida entra na fila como AGUARDANDO', () => {
    const s = emitirSenha('SG', hoje);
    assert.equal(s.estado, ESTADOS.AGUARDANDO);
    assert.deepEqual(s.historico.map((h) => h.estado), ['EMITIDA', 'AGUARDANDO']);
  });
  test('tipo inválido é rejeitado', () => {
    assert.throws(() => emitirSenha('XX', hoje), /inválido/);
  });
});

describe('RN02/RN03 - Priorização [SP] -> [SE|SG] -> [SP]', () => {
  test('sem histórico, SP vem primeiro', () => {
    emitirSenha('SG', hoje);
    emitirSenha('SE', hoje);
    emitirSenha('SP', hoje);
    assert.equal(escolherProximaSenha(db.senhas, null).tipo, 'SP');
  });
  test('após SP vem SE, depois SP, depois SG', async () => {
    ['SG', 'SG', 'SE', 'SP', 'SP'].forEach((t) => emitirSenha(t, hoje));
    const ordem = [];
    for (let i = 0; i < 5; i++) {
      const s = await chamarProxima({ usuario, guiche: 1, agora: hoje, validarExpediente: false });
      ordem.push(s.tipo);
      iniciarAtendimento({ senhaId: s.id, guiche: 1, agora: hoje });
      finalizarAtendimento({ senhaId: s.id, guiche: 1, agora: hoje });
    }
    assert.deepEqual(ordem, ['SP', 'SE', 'SP', 'SG', 'SG']);
  });
  test('FIFO dentro do mesmo tipo', async () => {
    const a = emitirSenha('SG', hoje);
    emitirSenha('SG', hoje);
    const s = await chamarProxima({ usuario, guiche: 1, agora: hoje, validarExpediente: false });
    assert.equal(s.numero, a.numero);
  });
  test('fila vazia retorna null', async () => {
    const s = await chamarProxima({ usuario, guiche: 1, agora: hoje, validarExpediente: false });
    assert.equal(s, null);
  });
});

describe('RN12 - Máquina de estados', () => {
  test('transições válidas e inválidas', () => {
    assert.ok(podeTransicionar('CHAMADA', 'CHAMADA_NOVAMENTE'));
    assert.ok(podeTransicionar('CHAMADA', 'EM_ATENDIMENTO'));
    assert.ok(!podeTransicionar('AGUARDANDO', 'ATENDIDA'));
    assert.ok(!podeTransicionar('ATENDIDA', 'CHAMADA'));
  });
  test('fluxo completo até ATENDIDA', async () => {
    emitirSenha('SP', hoje);
    const s = await chamarProxima({ usuario, guiche: 2, agora: hoje, validarExpediente: false });
    chamarNovamente({ senhaId: s.id, guiche: 2, agora: hoje });
    iniciarAtendimento({ senhaId: s.id, guiche: 2, agora: hoje });
    finalizarAtendimento({ senhaId: s.id, guiche: 2, agora: hoje });
    assert.deepEqual(
      s.historico.map((h) => h.estado),
      ['EMITIDA', 'AGUARDANDO', 'CHAMADA', 'CHAMADA_NOVAMENTE', 'EM_ATENDIMENTO', 'ATENDIDA'],
    );
  });
});

describe('RN06 - Não comparecimento após 2 chamadas', () => {
  test('não pode abandonar com apenas 1 chamada', async () => {
    emitirSenha('SG', hoje);
    const s = await chamarProxima({ usuario, guiche: 1, agora: hoje, validarExpediente: false });
    assert.throws(() => registrarNaoComparecimento({ senhaId: s.id, guiche: 1 }), /duas vezes/);
  });
  test('após 2 chamadas vira NAO_COMPARECEU', async () => {
    emitirSenha('SG', hoje);
    const s = await chamarProxima({ usuario, guiche: 1, agora: hoje, validarExpediente: false });
    chamarNovamente({ senhaId: s.id, guiche: 1, agora: hoje });
    registrarNaoComparecimento({ senhaId: s.id, guiche: 1, agora: hoje });
    assert.equal(s.estado, ESTADOS.NAO_COMPARECEU);
  });
  test('chamar próxima com senha em CHAMADA_NOVAMENTE abandona automaticamente', async () => {
    emitirSenha('SG', hoje);
    emitirSenha('SG', hoje);
    const s1 = await chamarProxima({ usuario, guiche: 1, agora: hoje, validarExpediente: false });
    chamarNovamente({ senhaId: s1.id, guiche: 1, agora: hoje });
    const s2 = await chamarProxima({ usuario, guiche: 1, agora: hoje, validarExpediente: false });
    assert.equal(s1.estado, ESTADOS.NAO_COMPARECEU);
    assert.notEqual(s1.id, s2.id);
  });
});

describe('Concorrência', () => {
  test('dois guichês chamando ao mesmo tempo recebem senhas diferentes', async () => {
    emitirSenha('SG', hoje);
    emitirSenha('SG', hoje);
    const [a, b] = await Promise.all([
      chamarProxima({ usuario, guiche: 1, agora: hoje, validarExpediente: false }),
      chamarProxima({ usuario, guiche: 2, agora: hoje, validarExpediente: false }),
    ]);
    assert.notEqual(a.id, b.id);
  });
});

describe('RN11 - Painel', () => {
  test('mostra no máximo 5 últimas chamadas, sem duplicar', async () => {
    for (let i = 0; i < 7; i++) emitirSenha('SG', hoje);
    for (let i = 0; i < 7; i++) {
      const s = await chamarProxima({ usuario, guiche: 1, agora: hoje, validarExpediente: false });
      iniciarAtendimento({ senhaId: s.id, guiche: 1 });
      finalizarAtendimento({ senhaId: s.id, guiche: 1 });
    }
    assert.equal(db.painel.length, 5);
    assert.equal(new Set(db.painel.map((p) => p.numero)).size, 5);
  });
});

describe('RN09/RN10 - Expediente', () => {
  const opcoes = { ignorarExpediente: false, expedienteInicio: 7, expedienteFim: 17 };
  test('limites de horário', () => {
    assert.ok(!dentroDoExpediente(new Date(2026, 8, 30, 6, 59), opcoes));
    assert.ok(dentroDoExpediente(new Date(2026, 8, 30, 7, 0), opcoes));
    assert.ok(!dentroDoExpediente(new Date(2026, 8, 30, 17, 0), opcoes));
  });
  test('encerramento descarta apenas a fila', async () => {
    emitirSenha('SG', hoje);
    emitirSenha('SG', hoje);
    const s = await chamarProxima({ usuario, guiche: 1, agora: hoje, validarExpediente: false });
    iniciarAtendimento({ senhaId: s.id, guiche: 1 });
    const r = encerrarExpediente();
    assert.equal(r.quantidadeDescartada, 1);
    assert.equal(s.estado, ESTADOS.EM_ATENDIMENTO);
  });
});

describe('RN08 - Tempo de atendimento', () => {
  test('faixas de variação', () => {
    for (let i = 0; i < 500; i++) {
      const sp = sortearTempoAtendimento('SP');
      const sg = sortearTempoAtendimento('SG');
      const se = sortearTempoAtendimento('SE');
      assert.ok(sp >= 10 && sp <= 20);
      assert.ok(sg >= 2 && sg <= 8);
      assert.ok(se === 1 || se === 5);
    }
  });
});

describe('RF13 - Relatórios', () => {
  test('simulação gera dados coerentes para o relatório diário', () => {
    const r1 = simularDia({ data: '2026-09-29', quantidade: 120 });
    assert.equal(r1.emitidas, 120);
    const rel = gerarRelatorio({ tipo: 'diario', referencia: '2026-09-29' });
    assert.equal(rel.totais.emitidas, 120);
    assert.equal(rel.porTipo.reduce((t, p) => t + p.emitidas, 0), 120);
    const naoAtendida = rel.detalhado.find((d) => d.estado !== 'ATENDIDA');
    if (naoAtendida) {
      assert.equal(naoAtendida.atendidaEm, null);
      assert.equal(naoAtendida.guiche, null);
    }
    const mensal = gerarRelatorio({ tipo: 'mensal', referencia: '2026-09' });
    assert.equal(mensal.totais.emitidas, 120);
  });
});
