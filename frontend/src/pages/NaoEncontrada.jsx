import { Link } from 'react-router-dom';

export default function NaoEncontrada() {
  return (
    <section>
      <h1>Página não encontrada</h1>
      <Link to="/" className="botao">Voltar ao início</Link>
    </section>
  );
}
