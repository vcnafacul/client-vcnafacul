// Varredura de pesos (tickets/059 §7.3, Type): font-thin/light → font-normal, font-black → font-extrabold.
import { type Contexto, type Lista, type Resultado, transformarClasses } from "./core";

const PESOS: Record<string, string> = {
  "font-thin": "font-normal",
  "font-light": "font-normal",
  "font-black": "font-extrabold",
};

export function processarPesos(lista: Lista, { placar }: Contexto) {
  for (const t of lista.ativos) if (PESOS[t.util]) t.troca(PESOS[t.util], "peso", placar);
}

export function transform(source: string, file: string): Resultado {
  return transformarClasses(source, file, processarPesos);
}
