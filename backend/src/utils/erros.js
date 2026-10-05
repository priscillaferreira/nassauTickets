/** Erro de regra de negócio, com o status HTTP que deve ser devolvido. */
export class ErroNegocio extends Error {
  constructor(mensagem, status = 400) {
    super(mensagem);
    this.name = 'ErroNegocio';
    this.status = status;
  }
}
