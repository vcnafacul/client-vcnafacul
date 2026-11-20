// Varredura de valores arbitrários (tickets/059 §7.3, sizes): espaçamento em px/rem vira passo da
// escala e calc(100vh-76px|88px) passa a usar a altura do header.
import { type Contexto, type Lista, type Resultado, transformarClasses } from "./core";

const ESPACO = "(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|space-x|space-y)";
const ARBITRARIO = new RegExp(`^(-?)(${ESPACO})-\\[([^\\]]+)\\]$`);
// escala padrão do Tailwind 3 (o config só acrescenta "header")
const PASSOS = new Set(
  "0 0.5 1 1.5 2 2.5 3 3.5 4 5 6 7 8 9 10 11 12 14 16 20 24 28 32 36 40 44 48 52 56 60 64 72 80 96".split(" "),
);
const CALC_HEADER = /calc\((100d?vh)-(?:76|88)px\)/g;

export function passoDaEscala(valor: string): string | null {
  const m = /^(\d+(?:\.\d+)?)(px|rem)$/.exec(valor);
  if (!m) return null;
  const px = Number(m[1]) * (m[2] === "rem" ? 16 : 1);
  if (px === 0) return "0";
  if (px === 1) return "px";
  const passo = String(px / 4);
  return PASSOS.has(passo) ? passo : null;
}

export function processarArbitrarios(lista: Lista, { placar }: Contexto) {
  for (const t of lista.ativos) {
    const m = ARBITRARIO.exec(t.util);
    if (m) {
      const [, neg, prop, valor] = m;
      const passo = passoDaEscala(valor);
      if (passo) t.troca(`${neg}${prop}-${passo}`, "espaco", placar);
      else t.revisa(`[${valor}] sem passo na escala → passo mais próximo`, "espaco-revisao", placar);
    } else if (t.util.search(CALC_HEADER) >= 0) {
      t.troca(t.util.replace(CALC_HEADER, "calc($1-theme(spacing.header))"), "calc-header", placar);
    }
  }
}

export function transform(source: string, file: string): Resultado {
  return transformarClasses(source, file, processarArbitrarios);
}
