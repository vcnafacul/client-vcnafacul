// @vitest-environment node
import { describe, expect, it } from "vitest";
import baseline from "./guard/baseline.json";
import { contarTudo } from "./guard/scan";
import { rules } from "./guard/rules";

// Catraca (tickets/059 §5.2): as contagens só podem cair. Na limpeza (Task 13) a baseline vira zero.
describe("guard do design system", () => {
  const contagens = contarTudo();
  const base = baseline as unknown as Record<string, number>;

  it.each(rules.map((r) => [r.id, r.description]))("%s: %s", (id) => {
    const atual = contagens[id];
    expect(
      atual,
      `${id}: ${atual} > baseline ${base[id]}. Contagens atuais: ${JSON.stringify(contagens)}`,
    ).toBeLessThanOrEqual(base[id]);
  });
});
