import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AbaLinhagem } from "./AbaLinhagem";
import {
  TEXTO_SEM_COPIAS,
  TEXTO_SEM_LINHAGEM,
  TEXTO_SEM_VERSOES,
  textoDaPosicao,
} from "./textoDaLinhagem";

const buscarLinhagem = vi.hoisted(() => vi.fn());
vi.mock("@/services/question/buscarLinhagem", () => ({ buscarLinhagem }));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));

const item = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  status: 0,
  congelada: false,
  enunciado: `enunciado de ${id}`,
  provas: 0,
  ...over,
});

const V1 = "665f0c1a2b3c4d5e6f000001";
const V2 = "665f0c1a2b3c4d5e6f000002";
const V3 = "665f0c1a2b3c4d5e6f000003";
const C1 = "665f0c1a2b3c4d5e6f0000c1";

const cadeia = {
  atual: V2,
  versoes: [
    item(V1, { congelada: true }),
    item(V2, { congelada: true }),
    item(V3, { status: 1, provas: 3 }),
  ],
  copias: [item(C1)],
  origemCopia: null,
};

const montar = (abrirQuestao = vi.fn(), questaoId = V2) => ({
  abrirQuestao,
  ...render(<AbaLinhagem questaoId={questaoId} abrirQuestao={abrirQuestao} />),
});

describe("AbaLinhagem (card 34A)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buscarLinhagem.mockResolvedValue(cadeia);
  });

  it("⚠️ abre em VERSÕES, com a cadeia inteira e a posição da atual", async () => {
    const { container } = montar();

    expect(await screen.findByText(textoDaPosicao(2, 3))).toBeTruthy();
    const itens = container.querySelectorAll("[data-lista-versoes] li");
    expect(
      [...itens].map((li) => li.getAttribute("data-item-linhagem")),
    ).toEqual([V1, V2, V3]);
  });

  it("cada item mostra o que identifica a questão", async () => {
    const { container } = montar();
    await screen.findByText(textoDaPosicao(2, 3));

    const v3 = container.querySelector(`[data-item-linhagem="${V3}"]`)!;
    expect(v3.textContent).toContain("000003");
    expect(v3.textContent).toContain(`enunciado de ${V3}`);
    expect(v3.textContent).toContain("Aprovada");
    expect(v3.textContent).toContain("em 3 provas");
    expect(
      container.querySelector(`[data-item-linhagem="${V1}"] [data-congelada]`),
    ).toBeTruthy();
  });

  it("clicar num item troca a questão", async () => {
    const { abrirQuestao, container } = montar();
    await screen.findByText(textoDaPosicao(2, 3));

    fireEvent.click(container.querySelector(`[data-abrir="${V1}"]`)!);

    expect(abrirQuestao).toHaveBeenCalledWith(V1);
  });

  it("⚠️ a atual NÃO é clicável", async () => {
    // Abri-la de novo só recarregaria o modal.
    const { container } = montar();
    await screen.findByText(textoDaPosicao(2, 3));

    expect(container.querySelector(`[data-abrir="${V2}"]`)).toBeNull();
    expect(
      container.querySelector(`[data-item-linhagem="${V2}"] [data-atual]`),
    ).toBeTruthy();
  });

  it("o alternador mostra as cópias", async () => {
    const { container } = montar();
    await screen.findByText(textoDaPosicao(2, 3));

    fireEvent.click(container.querySelector('[data-vista="copias"]')!);

    expect(
      container.querySelector(
        `[data-lista-copias] [data-item-linhagem="${C1}"]`,
      ),
    ).toBeTruthy();
    expect(container.querySelector("[data-lista-versoes]")).toBeNull();
  });

  it("⚠️ uma cópia mostra de quem é cópia", async () => {
    buscarLinhagem.mockResolvedValue({
      atual: C1,
      versoes: [],
      copias: [],
      origemCopia: item(V2),
    });
    const { container, abrirQuestao } = montar(vi.fn(), C1);

    // Sem versões, Versões diz por quê.
    expect(await screen.findByText(TEXTO_SEM_VERSOES)).toBeTruthy();

    fireEvent.click(container.querySelector('[data-vista="copias"]')!);
    expect(screen.getByText(TEXTO_SEM_COPIAS)).toBeTruthy();
    fireEvent.click(
      container.querySelector(`[data-origem-copia] [data-abrir="${V2}"]`)!,
    );
    expect(abrirQuestao).toHaveBeenCalledWith(V2);
  });

  it("⚠️ sem versões nem cópias, a aba aparece com o estado vazio", async () => {
    // Aba que some faria a barra de abas mudar de largura entre questões.
    buscarLinhagem.mockResolvedValue({
      atual: V1,
      versoes: [],
      copias: [],
      origemCopia: null,
    });
    montar();

    expect(await screen.findByText(TEXTO_SEM_LINHAGEM)).toBeTruthy();
  });

  it("falha na busca vira mensagem, não derruba o modal", async () => {
    buscarLinhagem.mockRejectedValue(new Error("caiu"));
    const { container } = montar();

    await waitFor(() =>
      expect(container.querySelector("[data-linhagem-erro]")).toBeTruthy(),
    );
  });
});
