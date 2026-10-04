import { criarApp } from './app.js';
import { config } from './config/config.js';
import { popularUsuariosIniciais } from './data/memoryDb.js';
import { dentroDoExpediente, encerrarExpediente } from './services/expedienteService.js';

popularUsuariosIniciais();

const app = criarApp();
app.listen(config.porta, () => {
  console.log(`nassauTickets API rodando em http://localhost:${config.porta}`);
  console.log(
    config.ignorarExpediente
      ? 'ATENÇÃO: IGNORAR_EXPEDIENTE=true (modo de testes, sem restrição de horário).'
      : `Expediente: ${config.expedienteInicio}h às ${config.expedienteFim}h.`,
  );
});

// RN10 - a cada minuto verifica se o expediente acabou e descarta a fila.
setInterval(() => {
  if (!dentroDoExpediente()) {
    const { quantidadeDescartada } = encerrarExpediente();
    if (quantidadeDescartada > 0) {
      console.log(`Fim do expediente: ${quantidadeDescartada} senha(s) descartada(s).`);
    }
  }
}, 60 * 1000);
