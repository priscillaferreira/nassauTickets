import { config } from '../config/config.js';
import { db } from '../data/memoryDb.js';
import { ESTADOS, ESTADOS_ATIVOS_NO_GUICHE, transicionar } from '../models/estadosSenha.js';
import { ErroNegocio } from '../utils/erros.js';
import { Mutex } from '../utils/lock.js';
import { exigirExpediente } from './expedienteService.js';
import { escolherProximaSenha } from './filaService.js';

const mutexChamada = new Mutex();

/** Senha que está ocupando o guichê (chamada ou em atendimento). */
export function senhaAtualDoGuiche(guiche) {
  return (
    db.senhas.find(
      (s) => s.guiche === Number(guiche) && ESTADOS_ATIVOS_NO_GUICHE.includes(s.estado),
    ) || null
  );
}

function publicarNoPainel(senha, ultimaChamada, agora) {
  db.contadorChamadas += 1;
  const item = {
    numero: senha.numero,
    tipo: senha.tipo,
    nomeTipo: senha.nomeTipo,
    guiche: senha.guiche,
    ultimaChamada,
    chamadaEm: agora.toISOString(),
    sequencia: db.contadorChamadas,
  };
  // A mesma senha não aparece duplicada: ela sobe para o topo.
  db.painel = [item, ...db.painel.filter((p) => p.numero !== senha.numero)].slice(
    0,
    config.tamanhoPainel,
  );
}

function exigirSenhaDoGuiche(senha, guiche) {
  if (senha.guiche !== Number(guiche)) {
    throw new ErroNegocio('Esta senha não pertence ao seu guichê.', 403);
  }
}

/**
 * RF04 - Chamar próxima senha.
 * Executado dentro de um Mutex: se dois atendentes clicarem ao mesmo tempo,
 * as chamadas são processadas em série e cada guichê recebe uma senha diferente.
 */
export function chamarProxima({ usuario, guiche, agora = new Date(), validarExpediente = true }) {
  return mutexChamada.executar(() => {
    if (validarExpediente) exigirExpediente(agora);

    const atual = senhaAtualDoGuiche(guiche);
    if (atual) {
      if (atual.estado === ESTADOS.CHAMADA_NOVAMENTE) {
        // RN06 - chamada duas vezes e não compareceu: abandona e segue a fila.
        marcarNaoCompareceu(atual, agora);
      } else if (atual.estado === ESTADOS.CHAMADA) {
        throw new ErroNegocio(
          'Use "Chamar novamente" antes de passar para a próxima senha.',
          409,
        );
      } else {
        throw new ErroNegocio('Finalize o atendimento atual antes de chamar outra senha.', 409);
      }
    }

    const senha = escolherProximaSenha(db.senhas, db.ultimoTipoChamado);
    if (!senha) return null;

    transicionar(senha, ESTADOS.CHAMADA, agora);
    senha.guiche = Number(guiche);
    senha.atendenteId = usuario.id;
    senha.atendenteNome = usuario.nome;
    senha.primeiraChamadaEm = agora.toISOString();
    db.ultimoTipoChamado = senha.tipo;
    publicarNoPainel(senha, false, agora);
    return senha;
  });
}

/** RF05 - Chamar novamente ("Última chamada"). Só é permitido uma vez. */
export function chamarNovamente({ senhaId, guiche, agora = new Date() }) {
  const senha = db.senhas.find((s) => s.id === Number(senhaId));
  if (!senha) throw new ErroNegocio('Senha não encontrada.', 404);
  exigirSenhaDoGuiche(senha, guiche);
  transicionar(senha, ESTADOS.CHAMADA_NOVAMENTE, agora);
  senha.segundaChamadaEm = agora.toISOString();
  publicarNoPainel(senha, true, agora);
  return senha;
}

/** RF06 - Iniciar atendimento (cliente compareceu ao guichê). */
export function iniciarAtendimento({ senhaId, guiche, agora = new Date() }) {
  const senha = db.senhas.find((s) => s.id === Number(senhaId));
  if (!senha) throw new ErroNegocio('Senha não encontrada.', 404);
  exigirSenhaDoGuiche(senha, guiche);
  transicionar(senha, ESTADOS.EM_ATENDIMENTO, agora);
  senha.inicioAtendimentoEm = agora.toISOString();
  return senha;
}

/** RF07 - Finalizar atendimento. */
export function finalizarAtendimento({ senhaId, guiche, agora = new Date() }) {
  const senha = db.senhas.find((s) => s.id === Number(senhaId));
  if (!senha) throw new ErroNegocio('Senha não encontrada.', 404);
  exigirSenhaDoGuiche(senha, guiche);
  transicionar(senha, ESTADOS.ATENDIDA, agora);
  senha.fimAtendimentoEm = agora.toISOString();
  return senha;
}

function marcarNaoCompareceu(senha, agora) {
  transicionar(senha, ESTADOS.NAO_COMPARECEU, agora);
  senha.motivoEncerramento = 'NAO_COMPARECEU_APOS_2_CHAMADAS';
  return senha;
}

/** RF08 - Registrar não comparecimento (somente após a 2ª chamada). */
export function registrarNaoComparecimento({ senhaId, guiche, agora = new Date() }) {
  const senha = db.senhas.find((s) => s.id === Number(senhaId));
  if (!senha) throw new ErroNegocio('Senha não encontrada.', 404);
  exigirSenhaDoGuiche(senha, guiche);
  if (senha.estado !== ESTADOS.CHAMADA_NOVAMENTE) {
    throw new ErroNegocio('A senha precisa ser chamada duas vezes antes de ser abandonada.', 409);
  }
  return marcarNaoCompareceu(senha, agora);
}

/** RF09 - Dados do painel: 5 últimas chamadas (nunca a próxima senha). */
export function dadosPainel() {
  return {
    ultimasChamadas: db.painel,
    ultimaChamada: db.painel[0] || null,
    atualizadoEm: new Date().toISOString(),
  };
}
