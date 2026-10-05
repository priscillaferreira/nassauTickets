/**
 * Tipos de senha (RN01) e seus tempos médios base (RN08).
 * tmBase em minutos.
 */
export const TIPOS_SENHA = Object.freeze({
  SP: { codigo: 'SP', nome: 'Prioritária', tmBase: 15 },
  SE: { codigo: 'SE', nome: 'Retirada de Exames', tmBase: 1 },
  SG: { codigo: 'SG', nome: 'Geral', tmBase: 5 },
});

export const CODIGOS_TIPO = Object.keys(TIPOS_SENHA);

export function tipoValido(tipo) {
  return CODIGOS_TIPO.includes(tipo);
}
