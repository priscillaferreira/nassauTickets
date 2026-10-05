import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Mensagem from '../components/Mensagem.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Login() {
  const { entrar } = useAuth();
  const navegar = useNavigate();
  const [formulario, setFormulario] = useState({ login: '', senha: '', guiche: '1' });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  function alterarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
  }

  async function enviar(evento) {
    evento.preventDefault();
    setErro('');
    setEnviando(true);
    try {
      await entrar(formulario.login, formulario.senha, Number(formulario.guiche));
      navegar('/atendente');
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="cartao formulario-login">
      <h1>Acesso do Atendente</h1>
      <form onSubmit={enviar}>
        <label htmlFor="login">Usuário</label>
        <input id="login" name="login" value={formulario.login} onChange={alterarCampo}
          autoComplete="username" required />

        <label htmlFor="senha">Senha</label>
        <input id="senha" name="senha" type="password" value={formulario.senha}
          onChange={alterarCampo} autoComplete="current-password" required />

        <label htmlFor="guiche">Guichê</label>
        <select id="guiche" name="guiche" value={formulario.guiche} onChange={alterarCampo}>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>Guichê {n}</option>
          ))}
        </select>

        <button type="submit" className="botao" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      <Mensagem tipo="erro">{erro}</Mensagem>
      <p className="dica">Usuários de teste: <code>ana</code> (gestora), <code>bruno</code>, <code>carla</code> — senha <code>senha123</code>.</p>
    </section>
  );
}
