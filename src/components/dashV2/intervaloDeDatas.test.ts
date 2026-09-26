/*
  ⚠️ Fuso fixo do Brasil ANTES de qualquer Date: os defeitos que este arquivo
  guarda (ler "2026-03-10" como UTC; comparar o texto da ISO) só aparecem
  num fuso negativo — em UTC, que é onde o CI roda, passariam calados. O Node
  aplica `TZ` na hora, e o vitest roda cada arquivo no seu processo
  (`pool: "forks"`), então não vaza para os outros testes.
*/
process.env.TZ = "America/Sao_Paulo";

import { describe, expect, it } from "vitest";
import {
  dentroDoIntervalo,
  intervaloAtivo,
  intervaloInvalido,
} from "./intervaloDeDatas";

/*
  ⚠️ Os instantes são montados com `new Date(ano, mes, dia, hora)` — LOCAIS —
  para o teste valer em qualquer fuso da máquina que o roda. A regra é "dia do
  calendário de quem usa", então é contra o fuso local que ela se mede.
*/
const local = (dia: number, hora = 12, min = 0, seg = 0, ms = 0) =>
  new Date(2026, 2, dia, hora, min, seg, ms); // março/2026

const marco = { de: "2026-03-10", ate: "2026-03-20" };

describe("dentroDoIntervalo (tickets/021 card 03)", () => {
  it("sem filtro: tudo passa, inclusive registro sem data", () => {
    expect(dentroDoIntervalo(local(1), {})).toBe(true);
    expect(dentroDoIntervalo(null, {})).toBe(true);
  });

  it.each([
    ["00:00:00.000 do primeiro dia", local(10, 0), true],
    ["23:59:59.999 do último dia", local(20, 23, 59, 59, 999), true],
    ["23:59:59.999 da véspera", local(9, 23, 59, 59, 999), false],
    ["00:00 do dia seguinte ao último", local(21, 0), false],
  ])("borda: %s", (_, data, esperado) => {
    expect(dentroDoIntervalo(data, marco)).toBe(esperado);
  });

  it("⚠️ string ISO em UTC é lida pelo dia LOCAL — registro às 23h30 do último dia entra", () => {
    // Em UTC-3 esta ISO já é dia 21; comparar os textos a jogaria fora
    const iso = local(20, 23, 30).toISOString();
    expect(dentroDoIntervalo(iso, marco)).toBe(true);
  });

  it("⚠️ 'de' não é lido como UTC — 00:30 do primeiro dia entra", () => {
    // `new Date("2026-03-10")` seria 21h do dia 9 em UTC-3, e um registro
    // da madrugada do dia 10 continuaria dentro — mas o das 22h do dia 9 também
    expect(dentroDoIntervalo(local(10, 0, 30), marco)).toBe(true);
    expect(dentroDoIntervalo(local(9, 22), marco)).toBe(false);
  });

  it("só 'de' e só 'até'", () => {
    expect(dentroDoIntervalo(local(25), { de: "2026-03-10" })).toBe(true);
    expect(dentroDoIntervalo(local(5), { de: "2026-03-10" })).toBe(false);
    expect(dentroDoIntervalo(local(5), { ate: "2026-03-10" })).toBe(true);
    expect(dentroDoIntervalo(local(15), { ate: "2026-03-10" })).toBe(false);
  });

  it("intervalo invertido: não filtra", () => {
    const invertido = { de: "2026-03-20", ate: "2026-03-10" };
    expect(dentroDoIntervalo(local(1), invertido)).toBe(true);
  });

  it.each([[null], [undefined], [""], ["não é data"]])(
    "com filtro, registro sem data válida (%p) não passa",
    (data) => {
      expect(dentroDoIntervalo(data, marco)).toBe(false);
    },
  );
});

describe("intervaloAtivo / intervaloInvalido", () => {
  it("ativo com qualquer um dos lados", () => {
    expect(intervaloAtivo({})).toBe(false);
    expect(intervaloAtivo({ de: "2026-03-10" })).toBe(true);
    expect(intervaloAtivo({ ate: "2026-03-10" })).toBe(true);
  });

  it("inválido só com os dois lados e até < de", () => {
    expect(intervaloInvalido({ de: "2026-03-20", ate: "2026-03-10" })).toBe(true);
    expect(intervaloInvalido({ de: "2026-03-10", ate: "2026-03-10" })).toBe(false);
    expect(intervaloInvalido({ de: "2026-03-20" })).toBe(false);
  });
});
