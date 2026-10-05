import { createContext, useContext, useState } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

function lerSessao() {
  try {
    return JSON.parse(sessionStorage.getItem('nt_sessao')) || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(lerSessao);

  async function entrar(login, senha, guiche) {
    const resposta = await api.login({ login, senha, guiche });
    // sessionStorage: a sessão some ao fechar o navegador (mais seguro em computador compartilhado)
    sessionStorage.setItem('nt_token', resposta.token);
    const novaSessao = { usuario: resposta.usuario, guiche: resposta.guiche };
    sessionStorage.setItem('nt_sessao', JSON.stringify(novaSessao));
    setSessao(novaSessao);
    return novaSessao;
  }

  async function sair() {
    try {
      await api.logout();
    } catch {
      // Mesmo sem backend, limpamos a sessão local.
    }
    sessionStorage.removeItem('nt_token');
    sessionStorage.removeItem('nt_sessao');
    setSessao(null);
  }

  const valor = {
    usuario: sessao?.usuario ?? null,
    guiche: sessao?.guiche ?? null,
    logado: Boolean(sessao),
    ehGestor: Boolean(sessao?.usuario?.perfis?.includes('GESTOR')),
    entrar,
    sair,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
