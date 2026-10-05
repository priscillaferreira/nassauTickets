export default function CartaoIndicador({ titulo, valor, detalhe }) {
  return (
    <div className="cartao-indicador">
      <span className="cartao-indicador-titulo">{titulo}</span>
      <strong className="cartao-indicador-valor">{valor}</strong>
      {detalhe && <span className="cartao-indicador-detalhe">{detalhe}</span>}
    </div>
  );
}
