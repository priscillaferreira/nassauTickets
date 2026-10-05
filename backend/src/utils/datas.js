const doisDigitos = (n) => String(n).padStart(2, '0');

/** Retorna "YYMMDD" (ex.: 260930) usado na numeração da senha (RN05). */
export function prefixoData(data = new Date()) {
  const yy = doisDigitos(data.getFullYear() % 100);
  const mm = doisDigitos(data.getMonth() + 1);
  const dd = doisDigitos(data.getDate());
  return `${yy}${mm}${dd}`;
}

/** Retorna "YYYY-MM-DD" no horário local. */
export function dataISO(data = new Date()) {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

/** Diferença em minutos entre duas datas (ISO ou Date). */
export function minutosEntre(inicio, fim) {
  if (!inicio || !fim) return null;
  return (new Date(fim) - new Date(inicio)) / 60000;
}

export function arredondar(valor, casas = 2) {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return null;
  const f = 10 ** casas;
  return Math.round(valor * f) / f;
}
