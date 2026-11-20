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
  for (const m of bloco.matchAll(/^\s{6,8}([a-zA-Z][a-zA-Z0-9]*):\s*(?:["{]|c\(|pair\()/gm)) {
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
  // Passos da escala tipográfica do design system (tailwind/type-scale.js).
  "hero",
  "display",
  "h1",
  "h2",
  "h3",
  "h4",
  "prose",
  "body",
  "caption",
  "label",
  "button",
  "overline",
  "numeric",
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

  it("o botão principal usa o par CTA (bg-cta + text-cta-foreground)", () => {
    // ⚠️ O texto do CTA é o `cta-foreground` (branco sobre orange-700, D8), e não
    // um branco avulso: o par garante o contraste. Ver tickets/059 D8.
    expect(dashV2.action.primary).toContain("bg-cta");
    expect(dashV2.action.primary).toContain("text-cta-foreground");
  });

  it("o amarelo não é usado em status", () => {
    // 1.27:1 sobre branco — invisível até como marcador.
    expect(JSON.stringify(dashV2.status)).not.toContain("yellow");
  });

  it("todo status tem chip, ponto e cor de ícone", () => {
    for (const [nome, v] of Object.entries(dashV2.status)) {
      expect(v.chip, nome).toBeTruthy();
      expect(v.dot, nome).toBeTruthy();
      // ⚠️ `icon` é a cor sobre branco, não sobre o chip — sem ela um tom novo
      // quebra o `SimuladoStatusIcon`, que indexa `status[tone].icon`.
      expect(v.icon, nome).toBeTruthy();
    }
  });

  it("nenhum tom repete o chip de outro", () => {
    /**
     * ⚠️ A regressão concreta: "Em cadastro" e "Em validação" saíam os dois em
     * `running` e eram indistinguíveis de relance no banco de provas. Dois tons
     * com o mesmo chip são, na prática, um tom só — e o próximo par de estados
     * cairia na mesma armadilha sem nada acusar.
     */
    const chips = Object.values(dashV2.status).map((v) => v.chip);
    expect(new Set(chips).size).toBe(chips.length);
  });

  it("o ícone do `running` não é laranja, e isso é medido", () => {
    /**
     * ⚠️ Nenhum laranja da paleta alcança 3:1 sobre branco (`darkOrange`
     * 2.45:1, `orange` 2.68:1). "Consertar" esta linha para acompanhar o `dot`
     * produz um ícone que parte das pessoas não enxerga.
     */
    expect(dashV2.status.running.dot).toContain("bg-cta");
    expect(dashV2.status.running.icon).not.toContain("range");
  });
});
