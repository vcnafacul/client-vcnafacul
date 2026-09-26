/*
  ⚠️ Fuso do Brasil antes de qualquer Date — o caso "criado às 23h do último
  dia" só existe num fuso negativo (ver o teste do `intervaloDeDatas`).
*/
process.env.TZ = "America/Sao_Paulo";

import { StatusEnum } from "@/enums/generic/statusEnum";
import { Inscription } from "@/types/partnerPrepCourse/inscription";
import { describe, expect, it } from "vitest";
import { contarFiltrosAtivos, filtrarProcessos, SEM_FILTROS } from "./filtros";

const agora = new Date(2026, 8, 26, 12);
const processo = (over: Partial<Inscription>) =>
  ({
    id: "p",
    name: "Processo",
    startDate: new Date(2026, 2, 1, 9),
    endDate: new Date(2099, 0, 1),
    createdAt: new Date(2026, 1, 1, 9),
    actived: StatusEnum.Approved,
    ...over,
  }) as Inscription;

const LISTA = [
  processo({ id: "a", name: "Inscrição 2026 — 1º semestre", startDate: new Date(2026, 2, 10), createdAt: new Date(2026, 1, 28, 23, 30) }),
  processo({ id: "b", name: "Vestibulinho 2025", startDate: new Date(2025, 7, 1), endDate: new Date(2025, 8, 1), createdAt: new Date(2025, 6, 1) }),
  processo({ id: "c", name: "INSCRICAO 2026 - 2º semestre", startDate: new Date(2026, 7, 1), createdAt: new Date(2026, 6, 15) }),
];
const ids = (l: Inscription[]) => l.map((p) => p.id);

describe("filtrarProcessos (tickets/021 card 05)", () => {
  it("sem filtros: todos", () => {
    expect(ids(filtrarProcessos(LISTA, SEM_FILTROS, agora))).toEqual(["a", "b", "c"]);
  });

  it("⚠️ nome: trecho, sem acento nem maiúscula", () => {
    const r = filtrarProcessos(LISTA, { ...SEM_FILTROS, nome: " inscricao " }, agora);
    expect(ids(r)).toEqual(["a", "c"]);
  });

  it("status: a mesma regra da coluna (encerrado pela data)", () => {
    const r = filtrarProcessos(LISTA, { ...SEM_FILTROS, status: StatusEnum.Rejected }, agora);
    expect(ids(r)).toEqual(["b"]);
  });

  it("Inicia em: intervalo", () => {
    const r = filtrarProcessos(
      LISTA,
      { ...SEM_FILTROS, iniciaEm: { de: "2026-01-01", ate: "2026-06-30" } },
      agora,
    );
    expect(ids(r)).toEqual(["a"]);
  });

  it("⚠️ Criado em: registro às 23h30 do último dia entra", () => {
    const r = filtrarProcessos(
      LISTA,
      { ...SEM_FILTROS, criadoEm: { ate: "2026-02-28" } },
      agora,
    );
    expect(ids(r)).toEqual(["a", "b"]);
  });

  it("os quatro combinados, por E", () => {
    const r = filtrarProcessos(
      LISTA,
      {
        nome: "inscri",
        status: StatusEnum.Approved,
        iniciaEm: { de: "2026-07-01" },
        criadoEm: { de: "2026-07-01", ate: "2026-07-31" },
      },
      agora,
    );
    expect(ids(r)).toEqual(["c"]);
  });
});

describe("contarFiltrosAtivos", () => {
  it("cada filtro conta 1; intervalo com um lado só também", () => {
    expect(contarFiltrosAtivos(SEM_FILTROS)).toBe(0);
    expect(contarFiltrosAtivos({ ...SEM_FILTROS, nome: "   " })).toBe(0);
    expect(
      contarFiltrosAtivos({
        nome: "x",
        status: StatusEnum.Pending,
        iniciaEm: { de: "2026-01-01" },
        criadoEm: { de: "2026-01-01", ate: "2026-02-01" },
      }),
    ).toBe(4);
  });
});
