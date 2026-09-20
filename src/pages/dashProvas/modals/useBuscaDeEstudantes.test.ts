import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import {
  DEBOUNCE_MS,
  MINIMO_PARA_BUSCAR,
  useBuscaDeEstudantes,
} from "./useBuscaDeEstudantes";

const buscarEstudantes = vi.hoisted(() => vi.fn());
vi.mock("@/services/cartaoResposta/buscarEstudantes", () => ({
  buscarEstudantes,
}));

const ACHADO = {
  userId: "u1",
  nome: "Cleyton Biffe",
  matricula: "20250185",
  turma: "Turma A",
};

beforeEach(() => {
  /*
    ⚠️ `shouldAdvanceTime`: o `waitFor` do testing-library usa timers REAIS por
    dentro. Com fake timers puros ele nunca progride e o teste estoura em 5s —
    foi o que aconteceu ao escrever este arquivo. Esta opção deixa o relógio
    falso andar junto com o real, então `advanceTimersByTime` continua
    controlando o debounce e o `waitFor` volta a funcionar.
  */
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.clearAllMocks();
  buscarEstudantes.mockResolvedValue({ estudantes: [ACHADO] });
});

afterEach(() => vi.useRealTimers());

describe("useBuscaDeEstudantes", () => {
  it("⚠️ abaixo do mínimo NÃO consulta", () => {
    renderHook(() => useBuscaDeEstudantes("An", "tok"));
    act(() => void vi.advanceTimersByTime(DEBOUNCE_MS * 3));

    expect(buscarEstudantes).not.toHaveBeenCalled();
  });

  it(`⚠️ ${MINIMO_PARA_BUSCAR} caracteres JÁ consultam`, () => {
    renderHook(() => useBuscaDeEstudantes("Ana", "tok"));
    act(() => void vi.advanceTimersByTime(DEBOUNCE_MS));

    expect(buscarEstudantes).toHaveBeenCalledWith("Ana", "tok");
  });

  it("⚠️ NÃO consulta antes dos 500ms", () => {
    renderHook(() => useBuscaDeEstudantes("Ana", "tok"));
    act(() => void vi.advanceTimersByTime(DEBOUNCE_MS - 1));

    expect(buscarEstudantes).not.toHaveBeenCalled();
  });

  it("⚠️ digitar rápido gera UMA consulta, não uma por tecla", () => {
    // Uma matrícula de oito dígitos dispararia seis consultas sem o debounce,
    // e as respostas voltam fora de ordem — a lista piscaria entre termos.
    const { rerender } = renderHook(
      ({ termo }) => useBuscaDeEstudantes(termo, "tok"),
      { initialProps: { termo: "202" } },
    );

    act(() => void vi.advanceTimersByTime(100));
    rerender({ termo: "2025" });
    act(() => void vi.advanceTimersByTime(100));
    rerender({ termo: "20250" });
    act(() => void vi.advanceTimersByTime(DEBOUNCE_MS));

    expect(buscarEstudantes).toHaveBeenCalledTimes(1);
    expect(buscarEstudantes).toHaveBeenCalledWith("20250", "tok");
  });

  it("devolve os estudantes e o estado pronto", async () => {
    const { result } = renderHook(() => useBuscaDeEstudantes("Ana", "tok"));
    await act(async () => {
      vi.advanceTimersByTime(DEBOUNCE_MS);
    });

    await waitFor(() => expect(result.current.estado).toBe("pronto"));
    expect(result.current.estudantes).toEqual([ACHADO]);
  });

  it("⚠️ apagar o termo LIMPA a lista", async () => {
    // Manter sugestões de um termo que não existe mais deixa a pessoa clicar
    // em alguém que ela não procurou.
    const { result, rerender } = renderHook(
      ({ termo }) => useBuscaDeEstudantes(termo, "tok"),
      { initialProps: { termo: "Ana" } },
    );
    await act(async () => {
      vi.advanceTimersByTime(DEBOUNCE_MS);
    });
    await waitFor(() => expect(result.current.estudantes).toHaveLength(1));

    rerender({ termo: "" });

    expect(result.current.estudantes).toEqual([]);
    expect(result.current.estado).toBe("parado");
  });

  it("erro de rede vira estado de erro, com lista vazia", async () => {
    buscarEstudantes.mockRejectedValue(new Error("caiu"));
    const { result } = renderHook(() => useBuscaDeEstudantes("Ana", "tok"));
    await act(async () => {
      vi.advanceTimersByTime(DEBOUNCE_MS);
    });

    await waitFor(() => expect(result.current.estado).toBe("erro"));
    expect(result.current.estudantes).toEqual([]);
  });

  it("espaço em volta não conta para o mínimo", () => {
    renderHook(() => useBuscaDeEstudantes("  An  ", "tok"));
    act(() => void vi.advanceTimersByTime(DEBOUNCE_MS));

    expect(buscarEstudantes).not.toHaveBeenCalled();
  });
});
