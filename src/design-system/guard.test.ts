// @vitest-environment node
import { describe, expect, it } from "vitest";
import { contarTudo } from "./guard/scan";
import { rules } from "./guard/rules";

// Estrito (tickets/059 §5.2): depois da limpeza (Task 13) toda regra exige zero. Sem baseline, sem catraca.
describe("guard do design system", () => {
  const contagens = contarTudo();

  it.each(rules.map((r) => [r.id, r.description]))("%s: %s", (id) => {
    expect(contagens[id], `${id}: ${contagens[id]}. Contagens: ${JSON.stringify(contagens)}`).toBe(0);
  });
});
