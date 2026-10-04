import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Executa uma função assíncrona agora e depois a cada "intervaloMs".
 * Retorna os dados, o erro e uma função para atualizar manualmente.
 */
export function usePolling(funcao, intervaloMs = 3000) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const funcaoRef = useRef(funcao);
  funcaoRef.current = funcao;

  const atualizar = useCallback(async () => {
    try {
      const resultado = await funcaoRef.current();
      setDados(resultado);
      setErro(null);
    } catch (e) {
      setErro(e);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    atualizar();
    const id = setInterval(atualizar, intervaloMs);
    return () => clearInterval(id); // limpeza ao sair da tela
  }, [atualizar, intervaloMs]);

  return { dados, erro, carregando, atualizar };
}
