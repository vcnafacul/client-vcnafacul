import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const API = "http://localhost:3333";

describe("fetch falso da vitrine (tickets/041, card 04)", () => {
  let real: ReturnType<typeof vi.fn>;
  let ligarFetchFalso: typeof import("./fetchFalso").ligarFetchFalso;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubEnv("VITE_BASE_URL", API);
    real = vi.fn(() => Promise.resolve(new Response("real")));
    window.fetch = real as unknown as typeof fetch;
    ({ ligarFetchFalso } = await import("./fetchFalso"));
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("responde pela rota falsa do estado montado, sem ir à api", async () => {
    ligarFetchFalso([{ caminho: /\/class\/[^/]+\/attendance-record$/, resposta: { corpo: { students: [1] } } }]);

    const r = await fetch(`${API}/class/abc/attendance-record`);

    expect(await r.json()).toEqual({ students: [1] });
    expect(real).not.toHaveBeenCalled();
  });

  it("casa o método: um POST não usa a rota de GET", async () => {
    ligarFetchFalso([{ caminho: /\/attendance-record$/, resposta: { corpo: { ok: true } } }]);

    const r = await fetch(`${API}/attendance-record`, { method: "POST" });

    expect(r.status).toBe(501);
  });

  it("rota da api sem resposta falsa vira 501 — a vitrine nunca grava de verdade", async () => {
    ligarFetchFalso([]);

    const r = await fetch(`${API}/attendance-record`, { method: "POST" });

    expect(r.status).toBe(501);
    expect(real).not.toHaveBeenCalled();
  });

  it("fora da api (Firebase, Maps) segue para o fetch real", async () => {
    ligarFetchFalso([]);

    await fetch("https://identitytoolkit.googleapis.com/v1/accounts:lookup", { method: "POST" });

    expect(real).toHaveBeenCalledTimes(1);
  });

  it("desligado, tudo passa direto", async () => {
    const desligar = ligarFetchFalso([{ caminho: /.*/, resposta: { corpo: {} } }]);
    desligar();

    await fetch(`${API}/user`);

    expect(real).toHaveBeenCalledTimes(1);
  });

  it("desligar um estado antigo não derruba o estado novo", async () => {
    const desligarAntigo = ligarFetchFalso([{ caminho: /\/user$/, resposta: { corpo: { v: 1 } } }]);
    ligarFetchFalso([{ caminho: /\/user$/, resposta: { corpo: { v: 2 } } }]);
    desligarAntigo();

    const r = await fetch(`${API}/user`);

    expect(await r.json()).toEqual({ v: 2 });
  });
});
