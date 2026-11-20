import { describe, expect, it } from "vitest";
import { transform } from "../sizes";
import { transform as pesos } from "../weights";
import { classes, esperaIntacto, esperaRevisao, esperaTroca } from "./ajuda";

const HOME = "src/pages/homeV2/Hero.tsx";

describe("sizes — Type (§7.3)", () => {
  it("text-xs, [10px], [11px], [9px], [0.65rem], [0.8rem] → text-caption", () =>
    esperaTroca(
      transform,
      ["text-xs", "text-[10px]", "text-[11px]", "text-[9px]", "text-[0.65rem]", "text-[0.8rem]"],
      "text-caption",
    ));

  it("text-sm → text-body", () => esperaTroca(transform, ["text-sm", "text-sm/6"], "text-body"));

  it("text-base → review (prose ou body)", () =>
    esperaRevisao(transform, ["text-base"], /leitura longa → text-prose; interface → text-body/));

  it("text-lg → text-h3", () => esperaTroca(transform, ["text-lg"], "text-h3"));

  it("text-xl → text-h2", () => esperaTroca(transform, ["text-xl"], "text-h2"));

  it("text-2xl → text-h1", () => esperaTroca(transform, ["text-2xl"], "text-h1"));

  it("text-3xl → text-h1; na home → review (título de seção → text-display)", () => {
    esperaTroca(transform, ["text-3xl"], "text-h1");
    esperaRevisao(transform, ["text-3xl"], /título de seção da home → text-display/, HOME);
  });

  it("text-4xl, text-5xl → review (home → display; fora → h1)", () =>
    esperaRevisao(transform, ["text-4xl", "text-5xl"], /home → text-display; fora dela → text-h1/));

  it("text-6xl…8xl → text-hero na home; fora dela → review (o guard barra text-hero)", () => {
    esperaTroca(transform, ["text-6xl", "text-7xl", "text-8xl"], "text-hero", HOME);
    esperaRevisao(transform, ["text-6xl"], /passo hero só vale no hero da home/);
  });

  it("text-[28px] (número de KPI) → text-numeric", () => esperaTroca(transform, ["text-[28px]"], "text-numeric"));

  it("text-[150px], [6rem], [8rem] → review (ícone ou ilustração)", () =>
    esperaRevisao(transform, ["text-[150px]", "text-[6rem]", "text-[8rem]"], /prop size do ícone ou w-\*/));

  it("outro tamanho arbitrário → review; cor arbitrária não é desta varredura", () => {
    esperaRevisao(transform, ["text-[13px]", "text-9xl"], /passo da escala/);
    esperaIntacto(transform, ["text-[#0b2747]", "text-white", "text-body"]);
  });

  it("font-thin, font-light → font-normal", () =>
    esperaTroca(pesos, ["font-thin", "font-light"], "font-normal"));

  it("font-black → font-extrabold", () => {
    esperaTroca(pesos, ["font-black"], "font-extrabold");
    esperaTroca(pesos, ["md:font-black"], "md:font-extrabold");
    esperaIntacto(pesos, ["font-bold", "font-semibold"]);
  });

  it("leading-*/tracking-* ao lado de um tamanho mapeado saem; tracking-wide fica no cabeçalho de tabela", () => {
    esperaTroca(transform, ["text-lg leading-6 font-bold"], "text-h3 font-bold");
    esperaTroca(transform, ["leading-tight text-2xl tracking-tight"], "text-h1");
    esperaTroca(
      transform,
      ["text-xs uppercase tracking-wide text-gray-500"],
      "text-caption uppercase tracking-wide text-gray-500",
    );
    // sem tamanho mapeado ao lado, leading fica
    esperaIntacto(transform, ["leading-6 font-bold"]);
  });
});

describe("sizes — pares responsivos", () => {
  it("text-lg md:text-xl → text-h3", () => esperaTroca(transform, ["text-lg md:text-xl"], "text-h3"));

  it("colapsa vários breakpoints e mantém o resto da lista", () => {
    esperaTroca(transform, ["font-bold text-sm sm:text-lg md:text-xl lg:text-2xl"], "font-bold text-body");
    // sm:text-base é revisão: o par fica inteiro
    esperaRevisao(transform, ["font-bold text-sm sm:text-base md:text-lg lg:text-2xl"], /sm:text-base → leitura longa/);
  });

  it("sem base mapeada, o tamanho com breakpoint vira o passo com o mesmo prefixo", () => {
    expect(classes(transform, "md:text-xl").classes).toBe("md:text-h2");
    const { classes: saida, revisao } = classes(transform, "text-base md:text-lg");
    expect(saida).toBe("text-base md:text-h3");
    expect(revisao).toMatch(/^text-base →/);
  });

  it("par com tamanho responsivo em revisão fica inteiro, com o motivo dos dois (nada some em silêncio)", () => {
    const casos: [string, string, RegExp][] = [
      ["text-2xl md:text-3xl", HOME, /md:text-3xl → título de seção da home → text-display/],
      ["text-2xl md:text-5xl leading-tight", HOME, /md:text-5xl → home → text-display/],
      ["text-xs md:text-[150px]", "src/pages/exemplo/index.tsx", /md:text-\[150px\] → ícone ou ilustração/],
    ];
    for (const [cls, file, motivo] of casos) {
      const { classes: saida, revisao, r } = classes(transform, cls, file);
      expect(saida, cls).toBe(cls);
      expect(revisao, cls).toMatch(motivo);
      expect(revisao, cls).toMatch(/par responsivo com tamanho em revisão: escolha um passo para o par/);
      expect(r.reviews, cls).toBe(1);
    }
    // fora da home, text-3xl tem destino: o par colapsa
    esperaTroca(transform, ["text-2xl md:text-3xl"], "text-h1");
  });

  it("variante que não é breakpoint não colapsa", () =>
    esperaTroca(transform, ["text-sm hover:text-lg"], "text-body hover:text-h3"));
});
