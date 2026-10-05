import { gerarHashSenha } from '../utils/hash.js';

/**
 * "Banco de dados" em memória usado na FASE 1.
 * Na FASE 2 será substituído por MySQL 8.0 (ver docs/mer/nassaudb.sql).
 * Ao reiniciar o servidor, os dados são perdidos.
 */
export const db = {
  senhas: [],
  usuarios: [],
  sessoes: new Map(), // token -> { usuarioId, guiche, expiraEm }
  sequencias: {}, // "260930-SP" -> 3
  painel: [], // últimas senhas chamadas (máx. 5)
  contadorChamadas: 0, // incrementa a cada chamada (usado pelo áudio do painel)
  ultimoTipoChamado: null, // controla a alternância SP -> SE|SG -> SP
  logEventos: [], // trilha de auditoria de segurança (login, logout, cadastros...)
  proximoId: 1,
};

export function novoId() {
  return db.proximoId++;
}

/** Usuários iniciais para testes. NUNCA use essas senhas em produção. */
export function popularUsuariosIniciais() {
  if (db.usuarios.length > 0) return;
  const iniciais = [
    { nome: 'Ana Gestora', login: 'ana', senha: 'senha123', perfis: ['ATENDENTE', 'GESTOR'] },
    { nome: 'Bruno Atendente', login: 'bruno', senha: 'senha123', perfis: ['ATENDENTE'] },
    { nome: 'Carla Atendente', login: 'carla', senha: 'senha123', perfis: ['ATENDENTE'] },
  ];
  for (const u of iniciais) {
    db.usuarios.push({
      id: novoId(),
      nome: u.nome,
      login: u.login,
      hashSenha: gerarHashSenha(u.senha),
      perfis: u.perfis,
      ativo: true,
    });
  }
}

/** Limpa tudo (usado nos testes automatizados). */
export function resetarBanco() {
  db.senhas = [];
  db.usuarios = [];
  db.sessoes = new Map();
  db.sequencias = {};
  db.painel = [];
  db.contadorChamadas = 0;
  db.ultimoTipoChamado = null;
  db.logEventos = [];
  db.proximoId = 1;
}

export function registrarEvento(tipo, detalhes = {}) {
  db.logEventos.push({ tipo, detalhes, em: new Date().toISOString() });
}
