// Carrega variáveis do arquivo .env (recurso nativo do Node 22), se ele existir.
try {
  process.loadEnvFile();
} catch {
  // Sem .env: usamos os valores padrão abaixo.
}

export const config = {
  porta: Number(process.env.PORT) || 3001,
  expedienteInicio: Number(process.env.EXPEDIENTE_INICIO ?? 7),
  expedienteFim: Number(process.env.EXPEDIENTE_FIM ?? 17),
  // Em desenvolvimento deixamos "true" para permitir testes à noite.
  ignorarExpediente: (process.env.IGNORAR_EXPEDIENTE ?? 'true') === 'true',
  corsOrigem: process.env.CORS_ORIGEM || '*',
  sessaoHoras: 8,
  quantidadeGuiches: 5,
  tamanhoPainel: 5,
};
