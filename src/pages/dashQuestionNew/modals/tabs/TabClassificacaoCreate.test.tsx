import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TabClassificacaoCreate } from "./TabClassificacaoCreate";

vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));
vi.mock("@/services/prova/getMissingNumber", () => ({
  getMissingNumber: vi.fn().mockResolvedValue([1, 2, 3]),
}));

const infos = {
  provas: [
    { _id: "custom", nome: "Simulado do cursinho", enemAreas: [] },
    {
      _id: "dia2",
      nome: "ENEM 2026 Dia 2",
      enemAreas: ["Ciências da Natureza", "Matemática"],
    },
  ],
  materias: [],
};

const montar = (formData: Record<string, unknown>) =>
  render(
    <TabClassificacaoCreate
      formData={formData}
      errors={{}}
      infos={infos}
      onChange={vi.fn()}
    />,
  );

/** O trigger do select de área: o combobox com o placeholder dele. */
const areaTrigger = () =>
  screen.getByText("Selecione a área").closest("button") as HTMLButtonElement;

/*
  ⚠️ Não abre os selects: cada montagem de Popper do Radix custa segundos de
  CPU no jsdom. O que se afirma é que o campo não trava — as opções vêm de
  `areasPermitidas`, testada à parte.
*/
describe("TabClassificacaoCreate — área destravada (area-enem 02)", () => {
  it("⚠️ em prova CUSTOMIZADA, a área não fica desabilitada", () => {
    // Antes: `enemAreas = []` → select vazio e desabilitado → não salvava.
    montar({ prova: "custom" });

    expect(areaTrigger().disabled).toBe(false);
  });

  it("⚠️ sem prova, a área também não trava", () => {
    montar({});

    // ⚠️ O NÚMERO continua dependendo da prova — só a área destravou.
    expect(areaTrigger().disabled).toBe(false);
  });
});
