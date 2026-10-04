export const TIPOS = {
  SP: { nome: 'Prioritária', classe: 'tipo-sp' },
  SE: { nome: 'Retirada de Exames', classe: 'tipo-se' },
  SG: { nome: 'Geral', classe: 'tipo-sg' },
};

export const nomeTipo = (tipo) => TIPOS[tipo]?.nome ?? tipo;

export const NOMES_ESTADO = {
  EMITIDA: 'Emitida',
  AGUARDANDO: 'Aguardando',
  CHAMADA: 'Chamada',
  CHAMADA_NOVAMENTE: 'Chamada novamente',
  EM_ATENDIMENTO: 'Em atendimento',
  ATENDIDA: 'Atendida',
  NAO_COMPARECEU: 'Não compareceu',
};

export function formatarDataHora(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('pt-BR');
}

export function formatarHora(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('pt-BR');
}

export function formatarMinutos(valor) {
  if (valor === null || valor === undefined) return '—';
  return `${Number(valor).toFixed(1).replace('.', ',')} min`;
}

export function hojeISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
