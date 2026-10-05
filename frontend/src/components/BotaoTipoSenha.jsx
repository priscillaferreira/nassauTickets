/** Botão grande do totem. Recebe tudo via props (reutilizável para SP, SE e SG). */
export default function BotaoTipoSenha({ tipo, titulo, descricao, classe, desabilitado, aoClicar }) {
  return (
    <button
      type="button"
      className={`botao-totem ${classe}`}
      disabled={desabilitado}
      onClick={() => aoClicar(tipo)}
    >
      <span className="botao-totem-titulo">{titulo}</span>
      <span className="botao-totem-descricao">{descricao}</span>
    </button>
  );
}
