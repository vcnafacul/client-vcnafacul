import { describe, it } from "vitest";
import { transform as arbitrarios } from "../arbitrary";
import { transform } from "../radius-shadow-z";
import { esperaIntacto, esperaRevisao, esperaTroca } from "./ajuda";

describe("radius-shadow-z — Radius, shadow, z-index (§7.3)", () => {
  it("rounded → rounded-sm (também com lado)", () => {
    esperaTroca(transform, ["rounded"], "rounded-sm");
    esperaTroca(transform, ["rounded-t"], "rounded-t-sm");
    esperaIntacto(transform, ["rounded-md", "rounded-full", "rounded-lg"]);
  });

  it("rounded-2xl, rounded-3xl → rounded-xl fora de homeV2/quemSomos", () => {
    esperaTroca(transform, ["rounded-2xl", "rounded-3xl"], "rounded-xl");
    esperaTroca(transform, ["rounded-t-3xl"], "rounded-t-xl");
    esperaIntacto(transform, ["rounded-2xl", "rounded-3xl"], "src/pages/homeV2/Secao.tsx");
    esperaIntacto(transform, ["rounded-3xl"], "src/pages/quemSomos/index.tsx");
  });

  it("shadow → shadow-sm; em superfície de página (cartão) → review", () => {
    esperaTroca(transform, ["shadow"], "shadow-sm");
    esperaTroca(transform, ["hover:shadow"], "hover:shadow-sm");
    esperaTroca(transform, ["absolute bg-white shadow"], "absolute bg-white shadow-sm");
    esperaRevisao(transform, ["bg-white rounded-md p-4 shadow"], /superfície na página: sem sombra/);
  });

  it("shadow-xl, shadow-2xl → shadow-lg", () => esperaTroca(transform, ["shadow-xl", "shadow-2xl"], "shadow-lg"));

  it("shadow-inner, shadow-[…] → review", () =>
    esperaRevisao(transform, ["shadow-inner", "shadow-[0_0_8px_rgba(0,0,0,0.2)]"], /sombra fora da escala/));

  it("z-10/20/30/40/50 → z-raised/sticky/header/overlay/popover", () => {
    esperaTroca(transform, ["z-10"], "z-raised");
    esperaTroca(transform, ["z-20"], "z-sticky");
    esperaTroca(transform, ["z-30"], "z-header");
    esperaTroca(transform, ["z-40"], "z-overlay");
    esperaTroca(transform, ["md:z-50"], "md:z-popover");
    esperaIntacto(transform, ["z-0", "-z-10", "z-auto"]);
  });

  it("z-[N] → review com a camada mais próxima", () => {
    esperaRevisao(transform, ["z-[60]"], /camada mais próxima \(z-toast\)/);
    esperaRevisao(transform, ["z-[999]"], /z-toast/);
    esperaRevisao(transform, ["z-[15]"], /z-raised|z-sticky/);
  });
});

describe("arbitrary — sizes (§7.3)", () => {
  it("p/m/gap-[Npx] → passo da escala; sem passo → review", () => {
    esperaTroca(arbitrarios, ["p-[48px]"], "p-12");
    esperaTroca(arbitrarios, ["gap-[56px]"], "gap-14");
    esperaTroca(arbitrarios, ["mt-[96px]"], "mt-24");
    esperaTroca(arbitrarios, ["-mx-[8px]"], "-mx-2");
    esperaTroca(arbitrarios, ["md:px-[1.5rem]"], "md:px-6");
    esperaTroca(arbitrarios, ["gap-x-[1px]"], "gap-x-px");
    esperaRevisao(arbitrarios, ["p-[52px]", "m-[13px]", "gap-[2%]"], /sem passo na escala/);
  });

  it("max-w-[500px]/[600px]/[90vw] de modal ficam: saem com o Dialog size", () =>
    esperaIntacto(arbitrarios, ["max-w-[500px]", "max-w-[600px]", "max-w-[90vw]"]));

  it("calc(100vh-76px) e calc(100vh-88px) → calc(100vh-theme(spacing.header))", () => {
    esperaTroca(arbitrarios, ["h-[calc(100vh-76px)]"], "h-[calc(100vh-theme(spacing.header))]");
    esperaTroca(arbitrarios, ["min-h-[calc(100vh-88px)]"], "min-h-[calc(100vh-theme(spacing.header))]");
    esperaIntacto(arbitrarios, ["h-[calc(100vh-200px)]"]);
  });

  it("outros w/h/min/max-[…] ficam (lista de revisão no PR, sem marcador)", () =>
    esperaIntacto(arbitrarios, ["w-[320px]", "h-[76px]", "min-w-[200px]", "max-h-[80vh]"]));
});
