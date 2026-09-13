import * as fs from "fs";
import * as path from "path";
import { describe, expect, it } from "vitest";
import { dashV2 } from "./tokens";

/**
 * A catraca da paleta.
 *
 * ⚠️ Um dos critérios do épico é "nenhuma cor fora do `tailwind.config.js` nos
 * componentes novos" — o `Select` do V1 tem `blue-500` e `slate-*` que entraram
 * sem ninguém decidir, e é assim que a deriva começa. Um comentário não impede
 * a próxima; este teste impede.
 *
 * Ele lê o `tailwind.config.js` de verdade, então uma cor removida de lá também
 * derruba o teste — que é o comportamento certo.
 */
function coresDaPaleta(): Set<string> {
  const config = fs.readFileSync(
    path.join(__dirname, "../../../tailwind.config.js"),
    "utf-8",
  );
  const bloco = config.slice(config.indexOf("colors: {"));
  const nomes = new Set<string>();
  for (const m of bloco.matchAll(/^\s{6,8}([a-zA-Z][a-zA-Z0-9]*):\s*"/gm)) {
    nomes.add(m[1]);
  }
  return nomes;
}

/** Toda string do objeto, em qualquer profundidade. */
function classes(valor: unknown, saida: string[] = []): string[] {
  if (typeof valor === "string") saida.push(...valor.split(/\s+/));
  else if (valor && typeof valor === "object") {
    Object.values(valor).forEach((v) => classes(v, saida));
  }
  return saida;
}

/** `bg-orange/10` → `orange`; `focus-visible:ring-orange/40` → `orange`. */
const COR =
  /^(?:[a-z-]+:)*(?:bg|text|border|ring|from|to|via)-([a-zA-Z][a-zA-Z0-9]*)(?:\/\d+)?$/;

// Utilitários que casam o formato mas não são cor.
const NAO_E_COR = new Set([
  "sm",
  "xs",
  "base",
  "lg",
  "xl",
  "2",
  "1",
  "0",
  "offset",
]);

describe("tokens do dashV2", () => {
  it("não usa nenhuma cor fora do tailwind.config.js", () => {
    const paleta = coresDaPaleta();
    expect(paleta.size).toBeGreaterThan(10); // o parser achou a paleta mesmo

    const forasteiras = classes(dashV2)
      .map((c) => COR.exec(c)?.[1])
      .filter((n): n is string => !!n && !NAO_E_COR.has(n))
      .filter((n) => !paleta.has(n));

    expect([...new Set(forasteiras)]).toEqual([]);
  });

  it.each(["blue", "slate", "gray", "zinc", "neutral", "stone"])(
    "não usa a família `%s` do Tailwind default",
    (familia) => {
      // ⚠️ São exatamente as que vazaram para o `Select` do V1.
      const todas = classes(dashV2).join(" ");
      expect(todas).not.toMatch(new RegExp(`-${familia}-\\d`));
    },
  );

  it("o texto do botão principal é marine, não branco", () => {
    // ⚠️ Branco sobre #FF7600 dá 2.68:1 e reprova; marine dá 5.62:1. É a
    // decisão que separa o V2 do V1 aqui, e ela é fácil de "consertar" de volta
    // por achar que botão laranja tem texto branco.
    expect(dashV2.action.primary).toContain("text-marine");
    expect(dashV2.action.primary).not.toContain("text-white");
  });

  it("o amarelo não é usado em status", () => {
    // 1.27:1 sobre branco — invisível até como marcador.
    expect(JSON.stringify(dashV2.status)).not.toContain("yellow");
  });

  it("todo status tem chip e ponto", () => {
    for (const [nome, v] of Object.entries(dashV2.status)) {
      expect(v.chip, nome).toBeTruthy();
      expect(v.dot, nome).toBeTruthy();
    }
  });
});
