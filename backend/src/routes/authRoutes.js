import { Router } from 'express';
import { login, logout } from '../services/authService.js';
import { exigirLogin } from '../middlewares/autenticacao.js';

const router = Router();

// POST /api/auth/login  { login, senha, guiche }
router.post('/login', (req, res) => {
  res.json(login(req.body || {}));
});

// POST /api/auth/logout
router.post('/logout', exigirLogin, (req, res) => {
  logout(req.token);
  res.status(204).end();
});

// GET /api/auth/me
router.get('/me', exigirLogin, (req, res) => {
  res.json({ usuario: req.usuario, guiche: req.guiche });
});

export default router;
