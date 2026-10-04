import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Cabecalho() {
  const { logado, usuario, guiche, ehGestor, sair } = useAuth();

  return (
    <header className="cabecalho">
      <Link to="/" className="marca" aria-label="Página inicial do nassauTickets">
        <img src="/logo.svg" alt="" width="36" height="36" />
        <span>
          nassau<strong>Tickets</strong>
        </span>
      </Link>

      <nav aria-label="Navegação principal">
        <NavLink to="/totem">Totem</NavLink>
        <NavLink to="/painel">Painel</NavLink>
        <NavLink to="/atendente">Atendente</NavLink>
        {ehGestor && <NavLink to="/gestao">Gestão</NavLink>}
      </nav>

      {logado ? (
        <div className="usuario-logado">
          <span>
            {usuario.nome} · Guichê {guiche}
          </span>
          <button type="button" className="botao botao-secundario" onClick={sair}>
            Sair
          </button>
        </div>
      ) : (
        <Link to="/login" className="botao botao-secundario">
          Entrar
        </Link>
      )}
    </header>
  );
}
