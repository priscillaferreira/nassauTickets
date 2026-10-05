import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

/** Gera hash seguro (scrypt + salt) — senhas nunca são guardadas em texto puro. */
export function gerarHashSenha(senha) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(senha, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function conferirSenha(senha, armazenado) {
  const [salt, hash] = armazenado.split(':');
  const calculado = scryptSync(senha, salt, 64);
  return timingSafeEqual(calculado, Buffer.from(hash, 'hex'));
}
