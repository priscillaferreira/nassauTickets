import { Router } from 'express';
import { exigirLogin } from '../middlewares/autenticacao.js';
import {
  chamarNovamente,
  chamarProxima,
  finalizarAtendimento,
  iniciarAtendimento,
  registrarNaoComparecimento,
  senhaAtualDoGuiche,
} from '../services/atendimentoService.js';

const router = Router();
router.use(exigirLogin);

// GET /api/atendimento/atual -> senha que está no guichê do atendente
router.get('/atual', (req, res) => {
  res.json({ guiche: req.guiche, senha: senhaAtualDoGuiche(req.guiche) });
});

// POST /api/atendimento/chamar-proxima
router.post('/chamar-proxima', async (req, res) => {
  const senha = await chamarProxima({ usuario: req.usuario, guiche: req.guiche });
  if (!senha) return res.status(200).json({ senha: null, mensagem: 'Não há senhas na fila.' });
  res.json({ senha });
});

// POST /api/atendimento/:id/chamar-novamente
router.post('/:id/chamar-novamente', (req, res) => {
  res.json({ senha: chamarNovamente({ senhaId: req.params.id, guiche: req.guiche }) });
});

// POST /api/atendimento/:id/iniciar
router.post('/:id/iniciar', (req, res) => {
  res.json({ senha: iniciarAtendimento({ senhaId: req.params.id, guiche: req.guiche }) });
});

// POST /api/atendimento/:id/finalizar
router.post('/:id/finalizar', (req, res) => {
  res.json({ senha: finalizarAtendimento({ senhaId: req.params.id, guiche: req.guiche }) });
});

// POST /api/atendimento/:id/nao-compareceu
router.post('/:id/nao-compareceu', (req, res) => {
  res.json({ senha: registrarNaoComparecimento({ senhaId: req.params.id, guiche: req.guiche }) });
});

export default router;
