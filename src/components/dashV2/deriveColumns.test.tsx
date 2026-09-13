import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CardDash } from "@/components/molecules/cardDash";
import { StatusContent } from "@/enums/content/statusContent";
import { StatusEnum } from "@/enums/generic/statusEnum";
import {
  CABECALHO_DA_COLUNA_PRIMARIA,
  ROTULO_STATUS_DESCONHECIDO,
  TAMANHO_DA_AMOSTRA,
  deriveColumns,
  rotuloDeStatus,
  toneDeStatus,
} from "./deriveColumns";

interface Registro {
  _id: string;
  nome: string;
  infos?: { field: string; value: string }[];
  status?: StatusEnum | StatusContent;
  logo?: string;
}

const transformar = (r: Registro): CardDash => ({
  id: `card-${r._id}`,
  title: r.nome,
  status: r.status ?? StatusEnum.Approved,
  infos: r.infos,
  logo: r.logo,
});

const reg = (
  _id: string,
  nome: string,
  infos?: { field: string; value: string }[],
): Registro => ({ _id, nome, infos });

describe("toneDeStatus / rotuloDeStatus", () => {
  it("mapeia os quatro status que as telas usam", () => {
    expect(toneDeStatus(StatusEnum.Approved)).toBe("done");
    expect(toneDeStatus(StatusEnum.Pending)).toBe("running");
    expect(toneDeStatus(StatusEnum.Rejected)).toBe("missing");
    expect(toneDeStatus(StatusContent.Pending_Upload)).toBe("running");
  });

  it("Pending é 0 e não pode cair no default", () => {
    // ⚠️ Um `||` no lugar do `??` transformaria "Pendente" em "Sem status" sem
    // erro nenhum — o modo de falha que este projeto persegue.
    expect(StatusEnum.Pending).toBe(0);
    expect(toneDeStatus(StatusEnum.Pending)).not.toBe("neutral");
    expect(rotuloDeStatus(StatusEnum.Pending)).toBe("Pendente");
  });

  it("status fora do mapa vira neutro rotulado, nunca badge sem texto", () => {
    expect(toneDeStatus(StatusEnum.All)).toBe("neutral");
    expect(rotuloDeStatus(StatusEnum.All)).toBe(ROTULO_STATUS_DESCONHECIDO);
  });
});

describe("deriveColumns — forma da tabela", () => {
  it("coluna 1 é o título, marcada primary, e a última é o status", () => {
    const colunas = deriveColumns(
      [reg("1", "ENEM 2019", [{ field: "Ano", value: "2019" }])],
      transformar,
    );

    expect(colunas.map((c) => c.id)).toEqual(["title", "info:Ano", "status"]);
    expect(colunas[0].header).toBe(CABECALHO_DA_COLUNA_PRIMARIA);
    expect(colunas[0].primary).toBe(true);
    expect(colunas[1].primary).toBeUndefined();
  });

  it("mesmo sem nenhuma entidade sobram título e status — colSpan 0 quebraria a tabela", () => {
    const colunas = deriveColumns([], transformar);
    expect(colunas.map((c) => c.id)).toEqual(["title", "status"]);
  });

  it("a amostra é das 10 primeiras: campo que só aparece na 8ª vira coluna", () => {
    const entidades = Array.from({ length: 30 }, (_, i) =>
      reg(String(i), `Reg ${i}`, [
        { field: "Ano", value: "2019" },
        // ⚠️ Só a 8ª entidade tem "Gabarito". Derivar da primeira perderia a
        // coluna — e derivar da 11ª também, daí o tamanho da amostra.
        ...(i === 7 ? [{ field: "Gabarito", value: "sim" }] : []),
        // Fora da amostra: não deve virar coluna.
        ...(i === 20 ? [{ field: "Invisível", value: "x" }] : []),
      ]),
    );

    const ids = deriveColumns(entidades, transformar).map((c) => c.id);
    expect(TAMANHO_DA_AMOSTRA).toBe(10);
    expect(ids).toContain("info:Gabarito");
    expect(ids).not.toContain("info:Invisível");
  });

  it("a ordem das colunas é a ordem de primeira aparição dos campos", () => {
    const colunas = deriveColumns(
      [
        reg("1", "A", [
          { field: "Zebra", value: "1" },
          { field: "Alfa", value: "2" },
        ]),
        reg("2", "B", [{ field: "Meio", value: "3" }]),
      ],
      transformar,
    );

    expect(colunas.map((c) => c.id)).toEqual([
      "title",
      "info:Zebra",
      "info:Alfa",
      "info:Meio",
      "status",
    ]);
  });

  it("o header é o campo aparado — 'Cadastrado em ' é literal em dashProvas", () => {
    const colunas = deriveColumns(
      [reg("1", "A", [{ field: "Cadastrado em ", value: "01/01/2024" }])],
      transformar,
    );
    expect(colunas[1].header).toBe("Cadastrado em");
    // O id guarda o campo cru — é ele que localiza o valor na linha.
    expect(colunas[1].id).toBe("info:Cadastrado em ");
  });
});

describe("deriveColumns — tipo da coluna", () => {
  const valorOrdenado = (
    entidades: Registro[],
    campo: string,
    alvo: Registro,
  ) => {
    const coluna = deriveColumns(entidades, transformar).find(
      (c) => c.id === `info:${campo}`,
    )!;
    return coluna.sortValue!(alvo);
  };

  it("numérica só quando TODOS os valores da amostra casam", () => {
    const numericos = [
      reg("1", "A", [{ field: "N", value: "10" }]),
      reg("2", "B", [{ field: "N", value: "9" }]),
    ];
    // 10 > 9 como número; como texto, "10" < "9".
    expect(valorOrdenado(numericos, "N", numericos[0])).toBe(10);

    const misturados = [
      reg("1", "A", [{ field: "N", value: "10" }]),
      reg("2", "B", [{ field: "N", value: "2019/2" }]),
    ];
    expect(valorOrdenado(misturados, "N", misturados[0])).toBe("10");
  });

  it("decimal com vírgula é numérico e vira número", () => {
    const linhas = [
      reg("1", "A", [{ field: "N", value: "3,5" }]),
      reg("2", "B", [{ field: "N", value: "12" }]),
    ];
    expect(valorOrdenado(linhas, "N", linhas[0])).toBe(3.5);
  });

  it("valor vazio não descaracteriza a coluna numérica e ordena como nulo", () => {
    const linhas = [
      reg("1", "A", [{ field: "N", value: "10" }]),
      reg("2", "B", [{ field: "N", value: "" }]),
    ];
    expect(valorOrdenado(linhas, "N", linhas[0])).toBe(10);
    expect(valorOrdenado(linhas, "N", linhas[1])).toBeNull();
  });

  it("coluna sem nenhum valor na amostra é texto, não numérica", () => {
    // ⚠️ `[].every(...)` é `true`: sem a exigência de pelo menos um valor, uma
    // coluna da qual não se sabe nada seria classificada como numérica.
    const linhas = [reg("1", "A", [{ field: "N", value: "" }])];
    const coluna = deriveColumns(linhas, transformar).find(
      (c) => c.id === "info:N",
    )!;
    expect(coluna.align).toBe("left");
  });

  it("coluna numérica alinha à direita; texto à esquerda", () => {
    const colunas = deriveColumns(
      [
        reg("1", "A", [
          { field: "N", value: "10" },
          { field: "T", value: "dez" },
        ]),
      ],
      transformar,
    );
    expect(colunas.find((c) => c.id === "info:N")!.align).toBe("right");
    expect(colunas.find((c) => c.id === "info:T")!.align).toBe("left");
  });

  it("valor não numérico FORA da amostra vira nulo, nunca NaN", () => {
    /**
     * ⚠️ `NaN` no comparador (`a - b`) deixa o `sort` indefinido e embaralha a
     * lista inteira — a lista fica "ordenada" e errada, sem erro nenhum.
     */
    const entidades = [
      ...Array.from({ length: 10 }, (_, i) =>
        reg(String(i), `A${i}`, [{ field: "N", value: String(i) }]),
      ),
      reg("fora", "Fora", [{ field: "N", value: "n/d" }]),
    ];
    const valor = valorOrdenado(entidades, "N", entidades[10]);
    expect(valor).toBeNull();
    expect(Number.isNaN(valor as number)).toBe(false);
  });
});

describe("deriveColumns — células", () => {
  it("a célula de status renderiza o StatusBadge com tom e rótulo", () => {
    const colunas = deriveColumns(
      [{ _id: "1", nome: "A", status: StatusEnum.Rejected }],
      transformar,
    );
    render(<>{colunas.at(-1)!.cell({ _id: "1", nome: "A", status: StatusEnum.Rejected })}</>);

    const badge = screen.getByText("Rejeitado");
    expect(badge).toHaveAttribute("data-tone", "missing");
  });

  it("logo vira avatar de 24px na coluna 1, e sem logo a célula é só o texto", () => {
    const comLogo: Registro = { _id: "1", nome: "Cursinho X", logo: "/x.png" };
    const semLogo: Registro = { _id: "2", nome: "Cursinho Y" };
    const colunas = deriveColumns([comLogo, semLogo], transformar);

    const { container } = render(<>{colunas[0].cell(comLogo)}</>);
    const img = container.querySelector("img")!;
    expect(img).toHaveAttribute("src", "/x.png");
    // ⚠️ `alt=""`: o título está ao lado e o leitor de tela leria o nome duas vezes.
    expect(img).toHaveAttribute("alt", "");
    expect(img.className).toContain("h-6");

    expect(colunas[0].cell(semLogo)).toBe("Cursinho Y");
  });

  it("a célula lê o valor do campo pelo nome, não pela posição", () => {
    /**
     * ⚠️ Cards do mesmo tipo podem omitir um `info`. Indexar por posição
     * mostraria o valor de "Validadas" embaixo do cabeçalho "Cadastradas" —
     * corrupção silenciosa exemplar.
     */
    const a = reg("1", "A", [
      { field: "Cadastradas", value: "10" },
      { field: "Validadas", value: "5" },
    ]);
    const b = reg("2", "B", [{ field: "Validadas", value: "7" }]);
    const colunas = deriveColumns([a, b], transformar);

    const cadastradas = colunas.find((c) => c.id === "info:Cadastradas")!;
    const validadas = colunas.find((c) => c.id === "info:Validadas")!;

    expect(cadastradas.cell(b)).toBe("");
    expect(validadas.cell(b)).toBe("7");
  });
});
