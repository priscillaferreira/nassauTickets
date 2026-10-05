import { api } from '../services/api.js';
import { usePolling } from '../hooks/usePolling.js';

/**
 * Recuperação de desastres (lado do frontend):
 * verifica o backend a cada 5 s e avisa o usuário quando ele cai.
 * As telas continuam abertas e voltam a funcionar sozinhas quando o servidor retorna.
 */
export default function StatusConexao() {
  const { dados, erro } = usePolling(api.saude, 5000);

  if (erro) {
    return (
      <div className="faixa-alerta faixa-erro" role="alert">
        ⚠️ Sem conexão com o servidor. Tentando reconectar automaticamente…
      </div>
    );
  }
  if (dados && !dados.expedienteAberto) {
    return (
      <div className="faixa-alerta faixa-aviso" role="status">
        Fora do horário de expediente (7h às 17h). Emissão e chamadas estão bloqueadas.
      </div>
    );
  }
  return null;
}
