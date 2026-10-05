import { Router } from 'express';
import { exigirGestor, exigirLogin } from '../middlewares/autenticacao.js';
import { cadastrarAtendente, listarUsuarios } from '../services/authService.js';
import { encerrarExpediente } from '../services/expedienteService.js';
import { gerarRelatorio } from '../services/relatorioService.js';
import { simularDia } from '../services/simulacaoService.js';

const router = Router();
router.use(exigirLogin, exigirGestor);

// GET /api/gestao/relatorios?tipo=diario&referencia=2026-09-30
// GET /api/gestao/relatorios?tipo=mensal&referencia=2026-09
router.get('/relatorios', (req, res) => {
  res.json(gerarRelatorio({ tipo: req.query.tipo, referencia: req.query.referencia }));
});

router.get('/usuarios', (_req, res) => {
  res.json(listarUsuarios());
});

router.post('/usuarios', (req, res) => {
  res.status(201).json(cadastrarAtendente(req.body || {}, req.usuario));
});

// POST /api/gestao/expediente/encerrar -> descarta senhas que sobraram na fila
router.post('/expediente/encerrar', (_req, res) => {
  res.json(encerrarExpediente());
});

// POST /api/gestao/simulacao  { data: "2026-09-29", quantidade: 150 }
router.post('/simulacao', (req, res) => {
  const quantidade = Math.min(Number(req.body?.quantidade) || 150, 900);
  res.status(201).json(simularDia({ data: req.body?.data, quantidade }));
});

export default router;
