import { useEffect, useState } from 'react';
import BotaoTipoSenha from '../components/BotaoTipoSenha.jsx';
import CartaoSenha from '../components/CartaoSenha.jsx';
import Mensagem from '../components/Mensagem.jsx';
import { api } from '../services/api.js';
import { formatarDataHora } from '../utils/formatadores.js';

const OPCOES = [
  { tipo: 'SP', titulo: 'Prioritária', descricao: 'Idosos, gestantes, PcD, lactantes', classe: 'tipo-sp' },
  { tipo: 'SE', titulo: 'Retirada de Exames', descricao: 'Buscar resultados de exames', classe: 'tipo-se' },
  { tipo: 'SG', titulo: 'Geral', descricao: 'Coleta e demais serviços', classe: 'tipo-sg' },
];

export default function Totem() {
  const [senhaEmitida, setSenhaEmitida] = useState(null);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Depois de 8 segundos o totem volta para a tela inicial.
  useEffect(() => {
    if (!senhaEmitida) return;
    const id = setTimeout(() => setSenhaEmitida(null), 8000);
    return () => clearTimeout(id);
  }, [senhaEmitida]);

  async function emitir(tipo) {
    setEnviando(true);
    setErro('');
    try {
      setSenhaEmitida(await api.emitirSenha(tipo));
    } catch (e) {
      setErro(
        e.status === 0
          ? 'Totem temporariamente indisponível. Por favor, dirija-se à recepção.'
          : e.message,
      );
    } finally {
      setEnviando(false);
    }
  }

  if (senhaEmitida) {
    return (
      <section className="totem" aria-live="polite">
        <h1>Sua senha</h1>
        <CartaoSenha numero={senhaEmitida.numero} tipo={senhaEmitida.tipo} destaque />
        <p>Emitida em {formatarDataHora(senhaEmitida.emitidaEm)}</p>
        <p>Aguarde ser chamado no painel.</p>
        <button type="button" className="botao" onClick={() => setSenhaEmitida(null)}>
          Concluir
        </button>
      </section>
    );
  }

  return (
    <section className="totem">
      <h1>Bem-vindo! Escolha o tipo de atendimento</h1>
      <div className="totem-opcoes">
        {OPCOES.map((o) => (
          <BotaoTipoSenha key={o.tipo} {...o} desabilitado={enviando} aoClicar={emitir} />
        ))}
      </div>
      <Mensagem tipo="erro">{erro}</Mensagem>
      <p className="nota-lgpd">
        🔒 Nenhum dado pessoal é solicitado para emitir a senha (LGPD).
      </p>
    </section>
  );
}
