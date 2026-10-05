/**
 * Áudio das chamadas usando a Web Speech API (nativa do navegador).
 * Ex.: "Senha prioritária, número 5. Dirija-se ao guichê 2."
 * Na segunda chamada, a frase começa com "Última chamada".
 */
import { nomeTipo } from '../utils/formatadores.js';

function bip() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.frequency.value = 880;
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // Navegador sem suporte: segue só com a fala.
  }
}

export function audioDisponivel() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function anunciarChamada({ numero, tipo, guiche, ultimaChamada }) {
  if (!audioDisponivel()) return;
  const sequencial = Number(numero.slice(-3));
  const texto =
    `${ultimaChamada ? 'Última chamada! ' : ''}` +
    `Senha ${nomeTipo(tipo)}, número ${sequencial}. Dirija-se ao guichê ${guiche}.`;

  bip();
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = 'pt-BR';
  fala.rate = 0.9;
  window.speechSynthesis.cancel();
  setTimeout(() => window.speechSynthesis.speak(fala), 300);
}
