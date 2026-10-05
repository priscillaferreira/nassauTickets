/**
 * Camada de comunicação com a API REST do backend.
 * Todas as chamadas usam fetch + JSON e possuem tempo limite,
 * para que a interface não "trave" se o backend cair.
 */
const BASE_URL = import.meta.env.VITE_API_URL || '';
const TEMPO_LIMITE_MS = 5000;

export class ErroApi extends Error {
  constructor(mensagem, status) {
    super(mensagem);
    this.status = status; // 0 = sem conexão com o servidor
  }
}

function obterToken() {
  return sessionStorage.getItem('nt_token');
}

async function requisitar(caminho, { metodo = 'GET', corpo, autenticado = false } = {}) {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TEMPO_LIMITE_MS);

  const cabecalhos = { 'Content-Type': 'application/json' };
  if (autenticado && obterToken()) cabecalhos.Authorization = `Bearer ${obterToken()}`;

  try {
    const resposta = await fetch(`${BASE_URL}${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo ? JSON.stringify(corpo) : undefined,
      signal: controlador.signal,
    });
    if (resposta.status === 204) return null;
    const dados = await resposta.json().catch(() => ({}));
    if (!resposta.ok) {
      throw new ErroApi(dados.erro || 'Erro ao comunicar com o servidor.', resposta.status);
    }
    return dados;
  } catch (erro) {
    if (erro instanceof ErroApi) throw erro;
    throw new ErroApi('Servidor indisponível. Verifique a conexão.', 0);
  } finally {
    clearTimeout(temporizador);
  }
}

export const api = {
  // Público
  saude: () => requisitar('/api/health'),
  emitirSenha: (tipo) => requisitar('/api/senhas', { metodo: 'POST', corpo: { tipo } }),
  painel: () => requisitar('/api/painel'),

  // Autenticação
  login: (dados) => requisitar('/api/auth/login', { metodo: 'POST', corpo: dados }),
  logout: () => requisitar('/api/auth/logout', { metodo: 'POST', autenticado: true }),

  // Atendente
  resumoFila: () => requisitar('/api/senhas/fila', { autenticado: true }),
  atendimentoAtual: () => requisitar('/api/atendimento/atual', { autenticado: true }),
  chamarProxima: () =>
    requisitar('/api/atendimento/chamar-proxima', { metodo: 'POST', autenticado: true }),
  chamarNovamente: (id) =>
    requisitar(`/api/atendimento/${id}/chamar-novamente`, { metodo: 'POST', autenticado: true }),
  iniciarAtendimento: (id) =>
    requisitar(`/api/atendimento/${id}/iniciar`, { metodo: 'POST', autenticado: true }),
  finalizarAtendimento: (id) =>
    requisitar(`/api/atendimento/${id}/finalizar`, { metodo: 'POST', autenticado: true }),
  naoCompareceu: (id) =>
    requisitar(`/api/atendimento/${id}/nao-compareceu`, { metodo: 'POST', autenticado: true }),

  // Gestor
  relatorio: (tipo, referencia) =>
    requisitar(`/api/gestao/relatorios?tipo=${tipo}&referencia=${referencia}`, { autenticado: true }),
  listarUsuarios: () => requisitar('/api/gestao/usuarios', { autenticado: true }),
  cadastrarUsuario: (dados) =>
    requisitar('/api/gestao/usuarios', { metodo: 'POST', corpo: dados, autenticado: true }),
  encerrarExpediente: () =>
    requisitar('/api/gestao/expediente/encerrar', { metodo: 'POST', autenticado: true }),
  simularDia: (data, quantidade) =>
    requisitar('/api/gestao/simulacao', {
      metodo: 'POST',
      corpo: { data, quantidade },
      autenticado: true,
    }),
};
