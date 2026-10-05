import { useEffect, useState } from 'react';
import CartaoIndicador from '../components/CartaoIndicador.jsx';
import CartaoSenha from '../components/CartaoSenha.jsx';
import Mensagem from '../components/Mensagem.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { usePolling } from '../hooks/usePolling.js';
import { api } from '../services/api.js';
import { formatarHora, NOMES_ESTADO } from '../utils/formatadores.js';

function useCronometro(inicioIso) {
  const [segundos, setSegundos] = useState(0);
  useEffect(() => {
    if (!inicioIso) return;
    const calcular = () => setSegundos(Math.floor((Date.now() - new Date(inicioIso)) / 1000));
    calcular();
    const id = setInterval(calcular, 1000);
    return () => clearInterval(id);
  }, [inicioIso]);
  const mm = String(Math.floor(segundos / 60)).padStart(2, '0');
  const ss = String(segundos % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function Atendente() {
  const { guiche, usuario } = useAuth();
  const atual = usePolling(api.atendimentoAtual, 3000);
  const fila = usePolling(api.resumoFila, 3000);
  const [mensagem, setMensagem] = useState({ tipo: 'info', texto: '' });
  const [processando, setProcessando] = useState(false);

  const senha = atual.dados?.senha ?? null;
  const cronometro = useCronometro(
    senha?.estado === 'EM_ATENDIMENTO' ? senha.inicioAtendimentoEm : null,
  );

  async function executar(acao, textoSucesso) {
    setProcessando(true);
    setMensagem({ tipo: 'info', texto: '' });
    try {
      const resposta = await acao();
      setMensagem({ tipo: 'sucesso', texto: resposta?.mensagem || textoSucesso });
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    } finally {
      setProcessando(false);
      atual.atualizar();
      fila.atualizar();
    }
  }

  const estado = senha?.estado;
  const podeChamarProxima = !senha || estado === 'CHAMADA_NOVAMENTE';
  const podeChamarNovamente = estado === 'CHAMADA';
  const podeIniciar = estado === 'CHAMADA' || estado === 'CHAMADA_NOVAMENTE';
  const podeFinalizar = estado === 'EM_ATENDIMENTO';
  const podeMarcarAusencia = estado === 'CHAMADA_NOVAMENTE';

  return (
    <section>
      <h1>Guichê {guiche}</h1>
      <p className="subtitulo">Atendente: {usuario?.nome}</p>

      <div className="grade-indicadores" aria-label="Senhas aguardando na fila">
        <CartaoIndicador titulo="Na fila" valor={fila.dados?.total ?? '—'} />
        <CartaoIndicador titulo="Prioritárias (SP)" valor={fila.dados?.SP ?? '—'} />
        <CartaoIndicador titulo="Exames (SE)" valor={fila.dados?.SE ?? '—'} />
        <CartaoIndicador titulo="Gerais (SG)" valor={fila.dados?.SG ?? '—'} />
      </div>

      <div className="cartao area-atendimento">
        {senha ? (
          <>
            <CartaoSenha numero={senha.numero} tipo={senha.tipo} destaque
              ultimaChamada={estado === 'CHAMADA_NOVAMENTE'} />
            <p>
              Situação: <strong>{NOMES_ESTADO[estado]}</strong>
              {senha.primeiraChamadaEm && <> · 1ª chamada {formatarHora(senha.primeiraChamadaEm)}</>}
              {senha.segundaChamadaEm && <> · 2ª chamada {formatarHora(senha.segundaChamadaEm)}</>}
            </p>
            {estado === 'EM_ATENDIMENTO' && (
              <p className="cronometro" aria-label="Tempo de atendimento">⏱ {cronometro}</p>
            )}
          </>
        ) : (
          <p>Nenhum cliente no guichê. Clique em <strong>Chamar próxima</strong>.</p>
        )}

        <div className="grupo-botoes">
          <button type="button" className="botao" disabled={processando || !podeChamarProxima}
            onClick={() => executar(api.chamarProxima, 'Senha chamada no painel.')}>
            📢 Chamar próxima
          </button>
          <button type="button" className="botao botao-aviso" disabled={processando || !podeChamarNovamente}
            onClick={() => executar(() => api.chamarNovamente(senha.id), 'Última chamada enviada ao painel.')}>
            🔁 Chamar novamente
          </button>
          <button type="button" className="botao botao-sucesso" disabled={processando || !podeIniciar}
            onClick={() => executar(() => api.iniciarAtendimento(senha.id), 'Atendimento iniciado.')}>
            ▶️ Iniciar atendimento
          </button>
          <button type="button" className="botao botao-sucesso" disabled={processando || !podeFinalizar}
            onClick={() => executar(() => api.finalizarAtendimento(senha.id), 'Atendimento finalizado.')}>
            ✅ Finalizar atendimento
          </button>
          <button type="button" className="botao botao-perigo" disabled={processando || !podeMarcarAusencia}
            onClick={() => executar(() => api.naoCompareceu(senha.id), 'Senha marcada como não compareceu.')}>
            🚫 Não compareceu
          </button>
        </div>
        <Mensagem tipo={mensagem.tipo}>{mensagem.texto}</Mensagem>
      </div>
    </section>
  );
}
