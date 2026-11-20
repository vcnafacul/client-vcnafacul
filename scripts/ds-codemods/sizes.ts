// Varredura de tamanhos de texto (tickets/059 §7.3, Type): escala nomeada, pares responsivos
// colapsados e leading/tracking removidos ao lado de um tamanho mapeado.
import { HOME, type Contexto, type Lista, type Resultado, type Token, transformarClasses } from "./core";

type Destino = { para: string } | { motivo: string };

const M = {
  base: "leitura longa → text-prose; interface → text-body",
  grande: "home → text-display; fora dela → text-h1",
  tituloHome: "título de seção da home → text-display; senão text-h1",
  hero: "o passo hero só vale no hero da home → text-display ou text-h1",
  icone: "ícone ou ilustração → prop size do ícone ou w-*",
  arbitrario: "tamanho arbitrário → passo da escala (text-caption…text-display)",
};

const TAMANHO = /^text-(xs|sm|base|lg|xl|[2-9]xl|\[([^\]]+)\])(?:\/[\w.[\]]+)?$/;

export function destinoDoTamanho(util: string, file: string): Destino | null {
  const m = TAMANHO.exec(util);
  if (!m) return null;
  const [, passo, arbitrario] = m;
  if (arbitrario !== undefined) {
    // cor arbitrária é da varredura de cores
    if (/^(?:#|rgba?\(|hsla?\(|color:|var\(--(?:color|cor))/i.test(arbitrario)) return null;
    if (/^(?:10px|11px|9px|0\.65rem|0\.8rem)$/.test(arbitrario)) return { para: "text-caption" };
    if (arbitrario === "28px") return { para: "text-numeric" };
    if (/^(?:150px|6rem|8rem)$/.test(arbitrario)) return { motivo: M.icone };
    return { motivo: M.arbitrario };
  }
  switch (passo) {
    case "xs":
      return { para: "text-caption" };
    case "sm":
      return { para: "text-body" };
    case "base":
      return { motivo: M.base };
    case "lg":
      return { para: "text-h3" };
    case "xl":
      return { para: "text-h2" };
    case "2xl":
      return { para: "text-h1" };
    case "3xl":
      return HOME(file) ? { motivo: M.tituloHome } : { para: "text-h1" };
    case "4xl":
    case "5xl":
      return { motivo: M.grande };
    case "6xl":
    case "7xl":
    case "8xl":
      return HOME(file) ? { para: "text-hero" } : { motivo: M.hero };
    default:
      return { motivo: M.arbitrario };
  }
}

export function processarTamanhos(lista: Lista, { file, placar }: Contexto) {
  const ativos = lista.ativos;
  const destinos = new Map<Token, Destino>();
  for (const t of ativos) {
    const d = destinoDoTamanho(t.util, file);
    if (d) destinos.set(t, d);
  }
  const base = ativos.find((t) => t.variantes.length === 0 && destinos.has(t) && "para" in destinos.get(t)!);
  for (const [t, d] of destinos) {
    // par responsivo: a base vira o passo e o tamanho com breakpoint sai (os passos já são responsivos)
    if (base && t !== base && t.variantes.length > 0 && t.soResponsivo) t.remove("tamanho-par-responsivo", placar);
    else if ("para" in d) t.troca(d.para, "tamanho", placar);
    else t.revisa(d.motivo, "tamanho-revisao", placar);
  }
  if (!base) return;
  // leading-*/tracking-* ao lado de um tamanho mapeado saem; tracking-wide* fica em rótulo uppercase
  const maiusculas = lista.tem(/^uppercase$/);
  for (const t of ativos) {
    if (t.mexido || !t.soResponsivo) continue;
    if (/^leading-/.test(t.util)) t.remove("tamanho-leading", placar);
    else if (/^tracking-/.test(t.util) && !(maiusculas && /^tracking-wide(?:r|st)?$/.test(t.util)))
      t.remove("tamanho-tracking", placar);
  }
}

export function transform(source: string, file: string): Resultado {
  return transformarClasses(source, file, processarTamanhos);
}
