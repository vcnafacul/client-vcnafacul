import { fireEvent, render, screen } from "@testing-library/react";
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

const montar = (formData: Record<string, unknown>, onChange = vi.fn()) => ({
  onChange,
  ...render(
    <TabClassificacaoCreate
      formData={formData}
      errors={{}}
      infos={infos}
      onChange={onChange}
    />,
  ),
});

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

describe("TabClassificacaoCreate — prova opcional (area-enem 03)", () => {
  it("⚠️ 'Sem prova' desfaz a escolha: limpa prova e número, mantém a área", () => {
    // Sem prova toda área cabe — não há o que reclassificar.
    const { onChange, container } = montar({
      prova: "dia2",
      numero: 2,
      enemArea: "Matemática",
    });

    fireEvent.click(container.querySelector("[data-sem-prova]")!);

    expect(onChange).toHaveBeenCalledWith("prova", "");
    expect(onChange).toHaveBeenCalledWith("numero", null);
    expect(onChange).not.toHaveBeenCalledWith("enemArea", "");
  });

  it("sem prova escolhida, não há o que desfazer", () => {
    const { container } = montar({});

    expect(container.querySelector("[data-sem-prova]")).toBeNull();
  });
});
