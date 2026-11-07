import { describe, expect, it, vi } from "vitest";
import { recarregarAoFalharChunk } from "./recarregarAoFalharChunk";

function montar(agora: number, ultimoReload?: number) {
  const alvo = new EventTarget();
  const dados = new Map<string, string>();
  if (ultimoReload !== undefined) dados.set("chunk-reload-em", String(ultimoReload));
  const recarregar = vi.fn();

  recarregarAoFalharChunk({
    janela: alvo as unknown as Window,
    armazenamento: {
      getItem: (k) => dados.get(k) ?? null,
      setItem: (k, v) => void dados.set(k, v),
    },
    recarregar,
    agora: () => agora,
  });

  const disparar = () => {
    const evento = new Event("vite:preloadError", { cancelable: true });
    alvo.dispatchEvent(evento);
    return evento;
  };
  return { disparar, recarregar, dados };
}

describe("recarregarAoFalharChunk", () => {
  it("recarrega e impede o erro de seguir quando um chunk falha", () => {
    const { disparar, recarregar, dados } = montar(50_000);

    const evento = disparar();

    expect(recarregar).toHaveBeenCalledTimes(1);
    expect(evento.defaultPrevented).toBe(true);
    expect(dados.get("chunk-reload-em")).toBe("50000");
  });

  it("não recarrega de novo se já recarregou há menos de 10s", () => {
    const { disparar, recarregar } = montar(50_000, 45_000);

    const evento = disparar();

    expect(recarregar).not.toHaveBeenCalled();
    expect(evento.defaultPrevented).toBe(false);
  });

  it("recarrega se o último reload foi há mais de 10s (outro deploy)", () => {
    const { disparar, recarregar } = montar(50_000, 30_000);

    disparar();

    expect(recarregar).toHaveBeenCalledTimes(1);
  });
});
