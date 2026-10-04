import { validarToken } from '../services/authService.js';
import { ErroNegocio } from '../utils/erros.js';

/** Exige header "Authorization: Bearer <token>". */
export function exigirLogin(req, _res, next) {
  const cabecalho = req.headers.authorization || '';
  const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : null;
  if (!token) return next(new ErroNegocio('Faça login para continuar.', 401));
  try {
    const { usuario, guiche } = validarToken(token);
    req.usuario = usuario;
    req.guiche = guiche;
    req.token = token;
    next();
  } catch (erro) {
    next(erro);
  }
}

/** Exige o perfil de gestor (cadastros e relatórios). */
export function exigirGestor(req, _res, next) {
  if (!req.usuario?.perfis.includes('GESTOR')) {
    return next(new ErroNegocio('Acesso permitido apenas ao gestor.', 403));
  }
  next();
}
