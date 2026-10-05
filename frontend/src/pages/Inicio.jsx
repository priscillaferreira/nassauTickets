import { Link } from 'react-router-dom';

const MODULOS = [
  { rota: '/totem', titulo: 'Totem', texto: 'Cliente retira sua senha (SP, SE ou SG).', icone: '🎫' },
  { rota: '/painel', titulo: 'Painel', texto: 'Exibe as 5 últimas senhas chamadas com áudio.', icone: '📺' },
  { rota: '/atendente', titulo: 'Atendente', texto: 'Chamar, iniciar e finalizar atendimentos.', icone: '🧑‍⚕️' },
  { rota: '/gestao', titulo: 'Gestão', texto: 'Relatórios, cadastros e simulação (gestor).', icone: '📊' },
];

export default function Inicio() {
  return (
    <section>
      <h1>Sistema de Controle de Atendimento</h1>
      <p className="subtitulo">Laboratório de Análises Clínicas · escolha um módulo</p>
      <div className="grade-modulos">
        {MODULOS.map((m) => (
          <Link key={m.rota} to={m.rota} className="cartao-modulo">
            <span className="cartao-modulo-icone" aria-hidden="true">{m.icone}</span>
            <strong>{m.titulo}</strong>
            <span>{m.texto}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
