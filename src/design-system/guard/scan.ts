import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { rules } from "./rules";

function listar(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? listar(join(dir, e.name)) : [join(dir, e.name)],
  );
}

/** Todos os arquivos (com caminho relativo, barras normais) de uma pasta. */
export function arquivosDe(dir: string): string[] {
  return listar(dir).map((f) => f.split("\\").join("/"));
}

/** Fonte varrida: ts/tsx de src, sem testes, stories nem o próprio design-system. */
export function arquivosVarridos(): string[] {
  return arquivosDe("src").filter(
    (f) =>
      /\.tsx?$/.test(f) &&
      !/\.(test|spec|stories)\.tsx?$/.test(f) &&
      !f.startsWith("src/design-system/"),
  );
}

export function contarTudo(): Record<string, number> {
  const total = Object.fromEntries(rules.map((r) => [r.id, 0]));
  for (const f of arquivosVarridos()) {
    const s = readFileSync(f, "utf-8");
    for (const r of rules) total[r.id] += r.match(s, f);
  }
  return total;
}
