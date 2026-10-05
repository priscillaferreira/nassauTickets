import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

/** Só renderiza a página se o usuário estiver logado (e for gestor, quando exigido). */
export default function RotaProtegida({ children, somenteGestor = false }) {
  const { logado, ehGestor } = useAuth();

  if (!logado) return <Navigate to="/login" replace />;
  if (somenteGestor && !ehGestor) {
    return <p className="mensagem mensagem-erro">Acesso permitido apenas ao gestor.</p>;
  }
  return children;
}
