// Varredura de raio, sombra e z-index (tickets/059 §7.3, Radius, shadow, z-index).
import { type Contexto, type Lista, type Resultado, transformarClasses } from "./core";

const LADO = "(?:-(?:t|r|b|l|tl|tr|br|bl|s|e|ss|se|es|ee))?";
const ROUNDED = new RegExp(`^rounded(${LADO})$`);
const ROUNDED_GRANDE = new RegExp(`^rounded(${LADO})-(?:2xl|3xl)$`);
const CAMADAS: [number, string][] = [
  [0, "z-base"],
  [10, "z-raised"],
  [20, "z-sticky"],
  [30, "z-header"],
  [40, "z-overlay"],
  [50, "z-popover"],
  [60, "z-toast"],
];
const Z: Record<string, string> = Object.fromEntries(CAMADAS.slice(1, 6).map(([n, c]) => [`z-${n}`, c]));

const SEM_ARREDONDADO_GRANDE = (file: string) => /^src\/pages\/(?:homeV2|quemSomos)\//.test(file);

export function camadaMaisProxima(n: number): string {
  return CAMADAS.reduce((a, b) => (Math.abs(b[0] - n) < Math.abs(a[0] - n) ? b : a))[1];
}

export function processarRaioSombraZ(lista: Lista, { file, placar }: Contexto) {
  // superfície na página (fundo de cartão, sem posicionamento): a sombra sai, não vira shadow-sm
  const superficie = lista.tem(/^(?:bg-white|bg-card|bg-background)$/) && !lista.tem(/^(?:absolute|fixed|sticky|-?z-.+)$/);
  for (const t of lista.ativos) {
    const u = t.util;
    let m: RegExpExecArray | null;
    if ((m = ROUNDED.exec(u))) t.troca(`rounded${m[1]}-sm`, "raio", placar);
    else if ((m = ROUNDED_GRANDE.exec(u)) && !SEM_ARREDONDADO_GRANDE(file)) t.troca(`rounded${m[1]}-xl`, "raio", placar);
    else if (u === "shadow") {
      if (superficie) t.revisa("superfície na página: sem sombra (Card); flutuante → shadow-sm", "sombra-revisao", placar);
      else t.troca("shadow-sm", "sombra", placar);
    } else if (u === "shadow-xl" || u === "shadow-2xl") t.troca("shadow-lg", "sombra", placar);
    else if (u === "shadow-inner" || u.startsWith("shadow-[")) t.revisa("sombra fora da escala → shadow-sm/md/lg ou nenhuma", "sombra-revisao", placar);
    else if (Z[u]) t.troca(Z[u], "z-index", placar);
    else if ((m = /^-?z-\[(-?\d+)\]$/.exec(u)))
      t.revisa(`camada mais próxima (${camadaMaisProxima(Number(m[1]))})`, "z-index-revisao", placar);
    else if (/^-?z-\[/.test(u)) t.revisa("z-index arbitrário → camada nomeada", "z-index-revisao", placar);
  }
}

export function transform(source: string, file: string): Resultado {
  return transformarClasses(source, file, processarRaioSombraZ);
}
