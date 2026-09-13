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

const rascunhoSalvo = {
  versao: 5,
  status: "rascunho" as const,
  criadorId: "Fernando",
  publicadaEm: null,
  notas: "restaurada da versão 2",
  origemVersao: 2,
};

describe("carregando", () => {
  it("não pisca 'nenhuma versão publicada' enquanto ainda não sabe", () => {
    // ⚠️ O estado vazio desta tela não é neutro: ele diz "nenhuma versão
    // publicada", que é alarmante. Piscá-lo a cada abertura do modal treina o
    // coordenador a ignorar justamente o aviso que mais importa, e no dia em
    // que for verdade ele não olha. Por isso carregando vence os outros ramos.
    const e = calcularEstado({
      carregando: true,
      publicada: null,
      rascunhoSalvo: null,
      relatorio: null,
    });
    expect(e.tipo).toBe("carregando");
    expect(e.tipo).not.toBe("sem-rascunho");
  });

  it("numa recarga, com dados em mãos, os botões continuam travados", () => {
    // ⚠️ Este é o que impede o clique durante um refresh: não se publica nem
    // se descarta o que ainda não se sabe se continua valendo.
    const e = calcularEstado({
      carregando: true,
      publicada,
      rascunhoSalvo: null,
      relatorio: relatorioLimpo,
    });
    expect(e.tipo).toBe("carregando");
    expect(e.podePublicar).toBe(false);
    expect(e.podeDescartar).toBe(false);
    // a versão já conhecida continua no topo — ela é verdade, e não pisca
    expect(e.versaoNoAr).toBe(3);
  });
});

describe("sem rascunho", () => {
  it("não tem o que publicar nem descartar", () => {
    const e = calcularEstado({
      carregando: false,
      publicada,
      rascunhoSalvo: null,
      relatorio: null,
    });
    expect(e.tipo).toBe("sem-rascunho");
    expect(e.podePublicar).toBe(false);
    expect(e.podeDescartar).toBe(false);
    expect(e.versaoNoAr).toBe(3);
  });

  it("sem versão publicada, o topo diz isso em vez de mentir", () => {
    // ⚠️ `versaoNoAr: 0` ou string vazia apareceria como "versão " na tela.
    // Este é o estado real de um ambiente onde o seed ainda não rodou.
    const e = calcularEstado({
      carregando: false,
      publicada: null,
      rascunhoSalvo: null,
      relatorio: null,
    });
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
    const e = calcularEstado({
      carregando: false,
      publicada,
      rascunhoSalvo: null,
      relatorio: comErro,
    });
    expect(e.tipo).toBe("rascunho-com-erro");
    expect(e.podePublicar).toBe(false);
  });

  it("descartar continua disponível — é a saída dele", () => {
    const e = calcularEstado({
      carregando: false,
      publicada,
      rascunhoSalvo: null,
      relatorio: comErro,
    });
    expect(e.podeDescartar).toBe(true);
  });

  it("os erros chegam à tela na ordem, um a um", () => {
    const e = calcularEstado({
      carregando: false,
      publicada,
      rascunhoSalvo: null,
      relatorio: comErro,
    });
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
      carregando: false,
      publicada,
      rascunhoSalvo: null,
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
    const e = calcularEstado({
      carregando: false,
      publicada,
      rascunhoSalvo: null,
      relatorio: relatorioLimpo,
    });
    expect(e.ignorados).toEqual(["conteudo.tex", "main.pdf"]);
  });

  it("zip sem sobras não inventa lista vazia visível", () => {
    const e = calcularEstado({
      carregando: false,
      publicada,
      rascunhoSalvo: null,
      relatorio: { ...relatorioLimpo, ignorados: [] },
    });
    expect(e.mostrarIgnorados).toBe(false);
  });
});

describe("rascunho salvo, sem relatório em mãos", () => {
  it("PUBLICAR FICA HABILITADO — o lint roda de novo no publicar", () => {
    // ⚠️ O relatório só existe logo depois de um upload, e não há endpoint que
    // o devolva para um rascunho salvo antes. Isso NÃO faz dele um rascunho de
    // estado desconhecido: o `publicar` re-linta de propósito (card 10), porque
    // o rascunho pode ter vindo de uma restauração feita antes de uma regra
    // nova existir. Reprovou, volta 409 com a lista — e é ela que desliga o
    // botão, pelo ramo do relatório.
    //
    // E este é o estado NORMAL depois de "Restaurar": exigir "envie o zip de
    // novo" de quem restaurou justamente porque não tem o zip trava a feature.
    const e = calcularEstado({
      carregando: false,
      publicada,
      rascunhoSalvo,
      relatorio: null,
    });
    expect(e.tipo).toBe("rascunho-sem-relatorio");
    expect(e.podePublicar).toBe(true);
    expect(e.podeDescartar).toBe(true);
    expect(e.erros).toEqual([]);
  });

  it("o relatório recém-chegado SOBREPÕE o rascunho salvo e desliga o botão", () => {
    // ⚠️ A regressão que este teste impede: avaliar `rascunhoSalvo` antes do
    // relatório faria o documento salvo mascarar o upload que ACABOU de ser
    // reprovado, e a tela voltaria a oferecer Publicar em cima de um lint que
    // já falhou. O relatório é o mais fresco dos dois — ele manda.
    const e = calcularEstado({
      carregando: false,
      publicada,
      rascunhoSalvo,
      relatorio: {
        ...relatorioLimpo,
        erros: ["main.tex — falta \\input{conteudo}"],
      },
    });
    expect(e.tipo).toBe("rascunho-com-erro");
    expect(e.podePublicar).toBe(false);
    expect(e.erros).toHaveLength(1);
  });

  it("carregando continua vencendo, mesmo com rascunho salvo", () => {
    const e = calcularEstado({
      carregando: true,
      publicada,
      rascunhoSalvo,
      relatorio: null,
    });
    expect(e.tipo).toBe("carregando");
    expect(e.podePublicar).toBe(false);
  });
});

describe("depois de publicar", () => {
  it("volta a 'sem rascunho' e o topo mostra a versão nova", () => {
    const e = calcularEstado({
      carregando: false,
      publicada: { ...publicada, versao: 4 },
      rascunhoSalvo: null,
      relatorio: null,
    });
    expect(e.tipo).toBe("sem-rascunho");
    expect(e.versaoNoAr).toBe(4);
  });
});
