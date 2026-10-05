import { Router } from 'express';
import { dadosPainel } from '../services/atendimentoService.js';

const router = Router();

// GET /api/painel -> 5 últimas senhas chamadas (público)
router.get('/', (_req, res) => {
  res.json(dadosPainel());
});

export default router;
