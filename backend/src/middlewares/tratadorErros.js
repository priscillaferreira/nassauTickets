/** Converte erros em respostas JSON padronizadas. */
// eslint-disable-next-line no-unused-vars
export function tratadorErros(erro, _req, res, _next) {
  const status = erro.status || 500;
  if (status >= 500) console.error('[ERRO]', erro);
  res.status(status).json({
    erro: status >= 500 ? 'Erro interno no servidor. Tente novamente.' : erro.message,
  });
}
