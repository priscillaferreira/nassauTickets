import { useEffect, useRef, useState } from 'react';
import CartaoSenha from '../components/CartaoSenha.jsx';
import { usePolling } from '../hooks/usePolling.js';
import { anunciarChamada, audioDisponivel } from '../services/audio.js';
import { api } from '../services/api.js';
import { formatarHora } from '../utils/formatadores.js';

const CHAVE_CACHE = 'nt_painel_cache';

function lerCache() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_CACHE));
  } catch {
    return null;
  }
}

export default function Painel() {
  const { dados, erro } = usePolling(api.painel, 2000);
  const [somAtivo, setSomAtivo] = useState(false);
  const ultimaSequenciaRef = useRef(null);

  // Se o backend cair, o painel continua mostrando os últimos dados conhecidos.
  const painel = dados ?? lerCache();

  useEffect(() => {
    if (dados) localStorage.setItem(CHAVE_CACHE, JSON.stringify(dados));
  }, [dados]);

  // Anuncia por áudio sempre que surgir uma nova chamada.
  useEffect(() => {
    const ultima = dados?.ultimaChamada;
    if (!ultima) return;
    if (ultimaSequenciaRef.current === null) {
      ultimaSequenciaRef.current = ultima.sequencia; // não fala ao abrir a tela
      return;
    }
    if (ultima.sequencia !== ultimaSequenciaRef.current) {
      ultimaSequenciaRef.current = ultima.sequencia;
      if (somAtivo) anunciarChamada(ultima);
    }
  }, [dados, somAtivo]);

  const [atual, ...anteriores] = painel?.ultimasChamadas ?? [];

  return (
    <section className="painel">
      <div className="painel-topo">
        <h1>Painel de Chamadas</h1>
        {audioDisponivel() && (
          <button
            type="button"
            className="botao botao-secundario"
            onClick={() => setSomAtivo((ativo) => !ativo)}
            aria-pressed={somAtivo}
          >
            {somAtivo ? '🔊 Som ativado' : '🔇 Ativar som'}
          </button>
        )}
      </div>

      {erro && (
        <p className="mensagem mensagem-aviso" role="status">
          Exibindo últimas informações conhecidas. Reconectando…
        </p>
      )}

      {!atual ? (
        <p className="painel-vazio">Aguardando a primeira chamada do dia…</p>
      ) : (
        <div className="painel-grade" aria-live="assertive">
          <div className="painel-atual">
            <h2>Senha chamada</h2>
            <CartaoSenha {...atual} destaque />
            <span className="painel-hora">{formatarHora(atual.chamadaEm)}</span>
          </div>
          <div className="painel-anteriores">
            <h2>Últimas chamadas</h2>
            <ul>
              {anteriores.map((c) => (
                <li key={c.numero}>
                  <CartaoSenha {...c} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
