/**
 * Mutex simples baseado em Promises.
 *
 * Garante que operações críticas (ex.: "chamar próxima senha") sejam
 * executadas UMA DE CADA VEZ, mesmo que dois atendentes cliquem ao mesmo
 * tempo. Assim a mesma senha nunca é entregue a dois guichês (RNF - Concorrência).
 *
 * Na fase 2 (MySQL) a mesma garantia será feita com transação +
 * SELECT ... FOR UPDATE SKIP LOCKED.
 */
export class Mutex {
  #fila = Promise.resolve();

  executar(funcao) {
    const resultado = this.#fila.then(() => funcao());
    // Mantém a fila andando mesmo se a função lançar erro.
    this.#fila = resultado.catch(() => {});
    return resultado;
  }
}
