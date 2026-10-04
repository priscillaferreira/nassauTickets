/** Mensagem de sucesso/erro com aria-live para leitores de tela (acessibilidade). */
export default function Mensagem({ tipo = 'info', children }) {
  if (!children) return null;
  return (
    <p className={`mensagem mensagem-${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}
