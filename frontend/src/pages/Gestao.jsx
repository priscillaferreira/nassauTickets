import { useEffect, useState } from 'react';
import CartaoIndicador from '../components/CartaoIndicador.jsx';
import Mensagem from '../components/Mensagem.jsx';
import Tabela from '../components/Tabela.jsx';
import { api } from '../services/api.js';
import {
  formatarDataHora,
  formatarHora,
  formatarMinutos,
  hojeISO,
  NOMES_ESTADO,
} from '../utils/formatadores.js';

const ABAS = [
  { id: 'relatorios', nome: 'Relatórios' },
  { id: 'cadastros', nome: 'Cadastros' },
  { id: 'operacao', nome: 'Operação' },
];

function Relatorios() {
  const [tipo, setTipo] = useState('diario');
  const [referencia, setReferencia] = useState(hojeISO());
  const [relatorio, setRelatorio] = useState(null);
  const [erro, setErro] = useState('');

  function trocarTipo(novoTipo) {
    setTipo(novoTipo);
    setReferencia(novoTipo === 'diario' ? hojeISO() : hojeISO().slice(0, 7));
  }

  async function gerar(evento) {
    evento.preventDefault();
    setErro('');
    try {
      setRelatorio(await api.relatorio(tipo, referencia));
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <>
      <form className="formulario-linha" onSubmit={gerar}>
        <label htmlFor="tipo">Tipo</label>
        <select id="tipo" value={tipo} onChange={(e) => trocarTipo(e.target.value)}>
          <option value="diario">Diário</option>
          <option value="mensal">Mensal</option>
        </select>
        <label htmlFor="referencia">{tipo === 'diario' ? 'Data' : 'Mês'}</label>
        <input id="referencia" type={tipo === 'diario' ? 'date' : 'month'} value={referencia}
          onChange={(e) => setReferencia(e.target.value)} required />
        <button type="submit" className="botao">Gerar relatório</button>
        {relatorio && (
          <button type="button" className="botao botao-secundario" onClick={() => window.print()}>
            Imprimir
          </button>
        )}
      </form>
      <Mensagem tipo="erro">{erro}</Mensagem>

      {relatorio && (
        <div className="relatorio">
          <div className="grade-indicadores">
            <CartaoIndicador titulo="Senhas emitidas" valor={relatorio.totais.emitidas} />
            <CartaoIndicador titulo="Senhas atendidas" valor={relatorio.totais.atendidas}
              detalhe={`${relatorio.totais.taxaAtendimentoPercent}% do total`} />
            <CartaoIndicador titulo="TM geral" valor={formatarMinutos(relatorio.totais.tmGeralMin)} />
            <CartaoIndicador titulo="Espera média" valor={formatarMinutos(relatorio.totais.esperaMediaMin)} />
          </div>

          <Tabela titulo="Quantitativo e Tempo Médio (TM) por prioridade"
            colunas={[
              { chave: 'nome', titulo: 'Tipo', formatar: (v, l) => `${l.tipo} - ${v}` },
              { chave: 'emitidas', titulo: 'Emitidas' },
              { chave: 'atendidas', titulo: 'Atendidas' },
              { chave: 'tmReferenciaMin', titulo: 'TM referência', formatar: formatarMinutos },
              { chave: 'tmRealMin', titulo: 'TM real', formatar: formatarMinutos },
              { chave: 'esperaMediaMin', titulo: 'Espera média', formatar: formatarMinutos },
            ]}
            linhas={relatorio.porTipo.map((p) => ({ ...p, id: p.tipo }))} />

          <Tabela titulo="Desempenho por atendente"
            colunas={[
              { chave: 'atendente', titulo: 'Atendente' },
              { chave: 'chamadas', titulo: 'Chamadas' },
              { chave: 'atendimentos', titulo: 'Atendimentos' },
              { chave: 'naoComparecimentos', titulo: 'Não compareceram' },
              { chave: 'tmMin', titulo: 'TM', formatar: formatarMinutos },
            ]}
            linhas={relatorio.desempenho.map((d) => ({ ...d, id: d.atendente }))} />

          <Tabela titulo="Relatório detalhado das senhas"
            colunas={[
              { chave: 'numero', titulo: 'Senha' },
              { chave: 'tipo', titulo: 'Tipo' },
              { chave: 'emitidaEm', titulo: 'Emissão', formatar: formatarDataHora },
              { chave: 'atendidaEm', titulo: 'Atendimento', formatar: formatarDataHora },
              { chave: 'guiche', titulo: 'Guichê' },
              { chave: 'estado', titulo: 'Situação', formatar: (v) => NOMES_ESTADO[v] },
            ]}
            linhas={relatorio.detalhado} />

          <Tabela titulo="Relatório de auditoria"
            colunas={[
              { chave: 'atendente', titulo: 'Atendente' },
              { chave: 'guiche', titulo: 'Guichê' },
              { chave: 'senha', titulo: 'Senha' },
              { chave: 'primeiraChamadaEm', titulo: '1ª chamada', formatar: formatarHora },
              { chave: 'segundaChamadaEm', titulo: '2ª chamada', formatar: formatarHora },
              { chave: 'inicioAtendimentoEm', titulo: 'Início', formatar: formatarHora },
              { chave: 'fimAtendimentoEm', titulo: 'Fim', formatar: formatarHora },
            ]}
            linhas={relatorio.auditoria} />
        </div>
      )}
    </>
  );
}

function Cadastros() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ nome: '', login: '', senha: '' });
  const [mensagem, setMensagem] = useState({ tipo: 'info', texto: '' });

  async function carregar() {
    try {
      setUsuarios(await api.listarUsuarios());
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function salvar(evento) {
    evento.preventDefault();
    try {
      await api.cadastrarUsuario(form);
      setMensagem({ tipo: 'sucesso', texto: 'Atendente cadastrado.' });
      setForm({ nome: '', login: '', senha: '' });
      carregar();
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    }
  }

  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <>
      <form className="formulario-linha" onSubmit={salvar}>
        <label htmlFor="nome">Nome</label>
        <input id="nome" name="nome" value={form.nome} onChange={alterar} required />
        <label htmlFor="novo-login">Login</label>
        <input id="novo-login" name="login" value={form.login} onChange={alterar} required />
        <label htmlFor="nova-senha">Senha</label>
        <input id="nova-senha" name="senha" type="password" minLength={6} value={form.senha}
          onChange={alterar} required />
        <button type="submit" className="botao">Cadastrar atendente</button>
      </form>
      <Mensagem tipo={mensagem.tipo}>{mensagem.texto}</Mensagem>
      <Tabela titulo="Atendentes cadastrados"
        colunas={[
          { chave: 'nome', titulo: 'Nome' },
          { chave: 'login', titulo: 'Login' },
          { chave: 'perfis', titulo: 'Perfis', formatar: (v) => v.join(', ') },
        ]}
        linhas={usuarios} />
    </>
  );
}

function Operacao() {
  const [data, setData] = useState(hojeISO());
  const [quantidade, setQuantidade] = useState(150);
  const [mensagem, setMensagem] = useState({ tipo: 'info', texto: '' });

  async function simular(evento) {
    evento.preventDefault();
    try {
      const r = await api.simularDia(data, Number(quantidade));
      setMensagem({ tipo: 'sucesso',
        texto: `Simulação de ${r.data}: ${r.emitidas} emitidas, ${r.atendidas} atendidas, ${r.descartadasFimExpediente} descartadas no fim do expediente.` });
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    }
  }

  async function encerrar() {
    if (!window.confirm('Encerrar o expediente e descartar as senhas que estão na fila?')) return;
    try {
      const r = await api.encerrarExpediente();
      setMensagem({ tipo: 'sucesso', texto: `${r.quantidadeDescartada} senha(s) descartada(s).` });
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message });
    }
  }

  return (
    <>
      <h2>Simular um dia de atendimento</h2>
      <p>Gera senhas e atendimentos com os tempos médios e a taxa de 5% de não comparecimento da especificação, para alimentar os relatórios.</p>
      <form className="formulario-linha" onSubmit={simular}>
        <label htmlFor="data-sim">Data</label>
        <input id="data-sim" type="date" value={data} onChange={(e) => setData(e.target.value)} required />
        <label htmlFor="qtd-sim">Quantidade de senhas</label>
        <input id="qtd-sim" type="number" min="1" max="900" value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)} />
        <button type="submit" className="botao">Simular</button>
      </form>

      <h2>Expediente</h2>
      <button type="button" className="botao botao-perigo" onClick={encerrar}>
        Encerrar expediente
      </button>
      <Mensagem tipo={mensagem.tipo}>{mensagem.texto}</Mensagem>
    </>
  );
}

export default function Gestao() {
  const [aba, setAba] = useState('relatorios');

  return (
    <section>
      <h1>Gestão</h1>
      <div className="abas" role="tablist">
        {ABAS.map((a) => (
          <button key={a.id} type="button" role="tab" aria-selected={aba === a.id}
            className={aba === a.id ? 'aba ativa' : 'aba'} onClick={() => setAba(a.id)}>
            {a.nome}
          </button>
        ))}
      </div>
      <div className="cartao">
        {aba === 'relatorios' && <Relatorios />}
        {aba === 'cadastros' && <Cadastros />}
        {aba === 'operacao' && <Operacao />}
      </div>
    </section>
  );
}
