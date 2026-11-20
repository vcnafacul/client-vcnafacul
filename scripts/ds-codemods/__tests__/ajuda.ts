import { expect } from "vitest";
import ts from "typescript";
import type { Resultado } from "../core";

export type Transform = (source: string, file: string) => Resultado;
export const TELA = "src/pages/exemplo/index.tsx";

/** Aplica a transform num <div className="…" /> e devolve as classes e o marcador. */
export function classes(transform: Transform, cls: string, file = TELA) {
  const r = transform(`export const A = () => <div className="${cls}" />;\n`, file);
  const m = /className="([^"]*)"(?: \/\* ds-review: (.*?) \*\/)?/.exec(r.code)!;
  return { classes: m[1], revisao: m[2] ?? null, r };
}

/** Cada classe vira `para`, sem marcador. */
export function esperaTroca(transform: Transform, de: string[], para: string, file = TELA) {
  for (const cls of de) expect(classes(transform, cls, file), cls).toMatchObject({ classes: para, revisao: null });
}

/** Cada classe fica como está, com o marcador ds-review contendo `motivo`. */
export function esperaRevisao(transform: Transform, de: string[], motivo: RegExp, file = TELA) {
  for (const cls of de) {
    const { classes: saida, revisao, r } = classes(transform, cls, file);
    expect(saida, cls).toBe(cls);
    expect(revisao, cls).toMatch(motivo);
    expect(r.reviews, cls).toBe(1);
  }
}

export function esperaIntacto(transform: Transform, de: string[], file = TELA) {
  for (const cls of de) expect(classes(transform, cls, file), cls).toMatchObject({ classes: cls, revisao: null });
}

/** O código gerado continua sendo TSX válido. */
export function semErroDeSintaxe(code: string) {
  const out = ts.transpileModule(code, {
    reportDiagnostics: true,
    fileName: "x.tsx",
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
  });
  expect(out.diagnostics?.map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n")) ?? []).toEqual([]);
}
