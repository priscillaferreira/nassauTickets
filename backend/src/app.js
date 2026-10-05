import cors from 'cors';
import express from 'express';
import { config } from './config/config.js';
import { tratadorErros } from './middlewares/tratadorErros.js';
import atendimentoRoutes from './routes/atendimentoRoutes.js';
import authRoutes from './routes/authRoutes.js';
import gestaoRoutes from './routes/gestaoRoutes.js';
import painelRoutes from './routes/painelRoutes.js';
import senhaRoutes from './routes/senhaRoutes.js';
import { dentroDoExpediente } from './services/expedienteService.js';

export function criarApp() {
  const app = express();
  app.use(cors({ origin: config.corsOrigem }));
  app.use(express.json({ limit: '100kb' }));

  // Health check: usado pelo frontend para saber se o backend está no ar.
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      banco: 'memoria',
      expedienteAberto: dentroDoExpediente(),
      horario: new Date().toISOString(),
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/senhas', senhaRoutes);
  app.use('/api/atendimento', atendimentoRoutes);
  app.use('/api/painel', painelRoutes);
  app.use('/api/gestao', gestaoRoutes);

  app.use((_req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
  app.use(tratadorErros);
  return app;
}
