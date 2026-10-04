import { nomeTipo, TIPOS } from '../utils/formatadores.js';

/** Exibe uma senha com a cor do seu tipo. Reutilizado no Totem, Painel e Atendente. */
export default function CartaoSenha({ numero, tipo, guiche, destaque = false, ultimaChamada = false }) {
  return (
    <article className={`cartao-senha ${TIPOS[tipo]?.classe ?? ''} ${destaque ? 'destaque' : ''}`}>
      {ultimaChamada && <span className="selo">Última chamada</span>}
      <span className="cartao-senha-tipo">{nomeTipo(tipo)}</span>
      <strong className="cartao-senha-numero">{numero}</strong>
      {guiche && <span className="cartao-senha-guiche">Guichê {guiche}</span>}
    </article>
  );
}
