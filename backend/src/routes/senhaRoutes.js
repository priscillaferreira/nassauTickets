import { Router } from 'express';
import { emitirSenha, resumoFila } from '../services/senhaService.js';
import { exigirLogin } from '../middlewares/autenticacao.js';

const router = Router();

// POST /api/senhas  { "tipo": "SP" }  -> Totem (anônimo)
router.post('/', (req, res) => {
  const senha = emitirSenha(req.body?.tipo);
  res.status(201).json({
    id: senha.id,
    numero: senha.numero,
    tipo: senha.tipo,
    nomeTipo: senha.nomeTipo,
    emitidaEm: senha.emitidaEm,
  });
});

// GET /api/senhas/fila -> apenas quantidades (atendente logado)
router.get('/fila', exigirLogin, (_req, res) => {
  res.json(resumoFila());
});

export default router;
