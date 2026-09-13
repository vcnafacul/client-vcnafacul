import { describe, expect, it } from "vitest";
import { calcularEstado } from "./estados";

const publicada = {
  versao: 3,
  status: "publicada" as const,
  criadorId: "Fernando",
  publicadaEm: "2026-09-12T14:00:00.000Z",
  notas: "",
  origemVersao: null,
};

const relatorioLimpo = {
  aceitos: ["main.tex", "preambulo.tex"],
  ignorados: ["conteudo.tex", "main.pdf"],
  erros: [],
  avisos: [],
};

describe("sem rascunho", () => {
  it("não tem o que publicar nem descartar", () => {
    const e = calcularEstado({ publicada, relatorio: null });
    expect(e.tipo).toBe("sem-rascunho");
    expect(e.podePublicar).toBe(false);
    expect(e.podeDescartar).toBe(false);
    expect(e.versaoNoAr).toBe(3);
  });

  it("sem versão publicada, o topo diz isso em vez de mentir", () => {
    // ⚠️ `versaoNoAr: 0` ou string vazia apareceria como "versão " na tela.
    // Este é o estado real de um ambiente onde o seed ainda não rodou.
    const e = calcularEstado({ publicada: null, relatorio: null });
    expect(e.versaoNoAr).toBeNull();
  });
});

describe("rascunho COM erro de lint", () => {
  const comErro = {
    ...relatorioLimpo,
    erros: [
      "main.tex — falta \\input{conteudo}",
      "preambulo.tex — \\begin{center} sem \\end{center}",
    ],
  };

  it("PUBLICAR FICA DESABILITADO", () => {
    // ⚠️ O teste que impede o defeito que arruína a feature. Publicar um
    // template que não compila para de gerar prova para todo mundo, e a
    // api recusaria com 409 — mas a tela não pode oferecer o botão.
    const e = calcularEstado({ publicada, relatorio: comErro });
    expect(e.tipo).toBe("rascunho-com-erro");
    expect(e.podePublicar).toBe(false);
  });

  it("descartar continua disponível — é a saída dele", () => {
    const e = calcularEstado({ publicada, relatorio: comErro });
    expect(e.podeDescartar).toBe(true);
  });

  it("os erros chegam à tela na ordem, um a um", () => {
    const e = calcularEstado({ publicada, relatorio: comErro });
    expect(e.erros).toEqual(comErro.erros);
  });
});

describe("rascunho com AVISO, sem erro", () => {
  it("PUBLICAR FICA HABILITADO — aviso não bloqueia", () => {
    // ⚠️ Decisão do card 10, tomada pelo dono: chave desbalanceada avisa e
    // não bloqueia, porque é a única regra que dá falso positivo em LaTeX
    // válido, e o Overleaf já compilou antes do upload. Bloquear aqui
    // reverteria essa decisão em silêncio, do lado da tela.
    const e = calcularEstado({
      publicada,
      relatorio: { ...relatorioLimpo, avisos: ["2 chaves sem fechar"] },
    });
    expect(e.tipo).toBe("rascunho-limpo");
    expect(e.podePublicar).toBe(true);
    expect(e.avisos).toHaveLength(1);
  });
});

describe("os ignorados", () => {
  it("aparecem, porque é o que o coordenador esquece", () => {
    // ⚠️ O zip do Overleaf traz o projeto inteiro e a plataforma pega dois
    // arquivos. Sem esta lista ele acha que subiu mais do que subiu — e um
    // dia jura que trocou a logo pela tela.
    const e = calcularEstado({ publicada, relatorio: relatorioLimpo });
    expect(e.ignorados).toEqual(["conteudo.tex", "main.pdf"]);
  });

  it("zip sem sobras não inventa lista vazia visível", () => {
    const e = calcularEstado({
      publicada,
      relatorio: { ...relatorioLimpo, ignorados: [] },
    });
    expect(e.mostrarIgnorados).toBe(false);
  });
});

describe("depois de publicar", () => {
  it("volta a 'sem rascunho' e o topo mostra a versão nova", () => {
    const e = calcularEstado({
      publicada: { ...publicada, versao: 4 },
      relatorio: null,
    });
    expect(e.tipo).toBe("sem-rascunho");
    expect(e.versaoNoAr).toBe(4);
  });
});
