import { randomUUID } from 'node:crypto';
import { config } from '../config/config.js';
import { db, novoId, registrarEvento } from '../data/memoryDb.js';
import { conferirSenha, gerarHashSenha } from '../utils/hash.js';
import { ErroNegocio } from '../utils/erros.js';

function usuarioPublico(u) {
  return { id: u.id, nome: u.nome, login: u.login, perfis: u.perfis, ativo: u.ativo };
}

function limparSessoesExpiradas() {
  const agora = Date.now();
  for (const [token, s] of db.sessoes) {
    if (s.expiraEm < agora) db.sessoes.delete(token);
  }
}

/** RF10 - Login do atendente, informando o guichê em que está trabalhando. */
export function login({ login, senha, guiche }) {
  limparSessoesExpiradas();
  const numeroGuiche = Number(guiche);
  if (!login || !senha) throw new ErroNegocio('Informe usuário e senha.', 400);
  if (!Number.isInteger(numeroGuiche) || numeroGuiche < 1 || numeroGuiche > config.quantidadeGuiches) {
    throw new ErroNegocio(`Guichê inválido (1 a ${config.quantidadeGuiches}).`, 400);
  }

  const usuario = db.usuarios.find((u) => u.login === login && u.ativo);
  // Mensagem genérica: não revela se o erro foi no usuário ou na senha (segurança).
  if (!usuario || !conferirSenha(senha, usuario.hashSenha)) {
    registrarEvento('LOGIN_FALHOU', { login });
    throw new ErroNegocio('Usuário ou senha inválidos.', 401);
  }

  for (const [token, s] of db.sessoes) {
    if (s.guiche === numeroGuiche && s.usuarioId !== usuario.id) {
      throw new ErroNegocio(`O guichê ${numeroGuiche} já está em uso por outro atendente.`, 409);
    }
    if (s.usuarioId === usuario.id) db.sessoes.delete(token); // derruba sessão antiga
  }

  const token = randomUUID();
  db.sessoes.set(token, {
    usuarioId: usuario.id,
    guiche: numeroGuiche,
    expiraEm: Date.now() + config.sessaoHoras * 3600 * 1000,
  });
  registrarEvento('LOGIN', { usuario: usuario.login, guiche: numeroGuiche });
  return { token, guiche: numeroGuiche, usuario: usuarioPublico(usuario) };
}

export function logout(token) {
  const sessao = db.sessoes.get(token);
  if (sessao) registrarEvento('LOGOUT', { usuarioId: sessao.usuarioId });
  db.sessoes.delete(token);
}

export function validarToken(token) {
  const sessao = db.sessoes.get(token);
  if (!sessao || sessao.expiraEm < Date.now()) {
    db.sessoes.delete(token);
    throw new ErroNegocio('Sessão inválida ou expirada. Faça login novamente.', 401);
  }
  const usuario = db.usuarios.find((u) => u.id === sessao.usuarioId && u.ativo);
  if (!usuario) throw new ErroNegocio('Usuário inativo.', 401);
  return { usuario: usuarioPublico(usuario), guiche: sessao.guiche };
}

/** RF12 - Cadastros (somente gestor). */
export function listarUsuarios() {
  return db.usuarios.map(usuarioPublico);
}

export function cadastrarAtendente({ nome, login, senha, gestor = false }, autor) {
  if (!nome || !login || !senha) throw new ErroNegocio('Nome, login e senha são obrigatórios.', 400);
  if (senha.length < 6) throw new ErroNegocio('A senha deve ter pelo menos 6 caracteres.', 400);
  if (db.usuarios.some((u) => u.login === login)) {
    throw new ErroNegocio('Já existe um usuário com esse login.', 409);
  }
  if (gestor && db.usuarios.some((u) => u.perfis.includes('GESTOR'))) {
    // Especificação: apenas UM atendente possui o perfil adicional de gestor.
    throw new ErroNegocio('Já existe um gestor cadastrado. Só é permitido um.', 409);
  }
  const novo = {
    id: novoId(),
    nome,
    login,
    hashSenha: gerarHashSenha(senha),
    perfis: gestor ? ['ATENDENTE', 'GESTOR'] : ['ATENDENTE'],
    ativo: true,
  };
  db.usuarios.push(novo);
  registrarEvento('USUARIO_CADASTRADO', { login, por: autor?.login });
  return usuarioPublico(novo);
}
