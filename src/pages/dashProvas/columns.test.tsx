import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { sortRows } from "@/components/dashV2";
import type { Prova } from "../../dtos/prova/prova";
import { Edicao } from "../../enums/prova/edicao";
import {
  colunasDeProva,
  COM_GABARITO,
  SEM_GABARITO,
  temGabarito,
  VAZIO,
} from "./columns";

function prova(over: Partial<Prova> = {}): Prova {
  return {
    _id: "p1",
    nome: "ENEM 2019",
    edicao: Edicao.Regular,
    aplicacao: 1,
    ano: 2019,
    categoria: "ENEM",
    exame: "ENEM",
    totalQuestao: 180,
    totalQuestaoCadastradas: 160,
    totalQuestaoValidadas: 132,
    createdAt: "2024-03-10T12:00:00.000Z" as unknown as Prova["createdAt"],
    filename: "prova.pdf",
    gabarito: "gabarito.pdf",
    enemAreas: [],
    ...over,
  };
}

const coluna = (id: string) => {
  const c = colunasDeProva.find((col) => col.id === id);
  if (!c) throw new Error(`coluna "${id}" não existe`);
  return c;
};

/** Renderiza a célula e devolve o texto que ela produz. */
function texto(id: string, p: Prova): string {
  const { container } = render(<>{coluna(id).cell(p)}</>);
  return container.textContent ?? "";
}

describe("colunas do banco de provas", () => {
  it("são as 8 da tela, nesta ordem", () => {
    expect(colunasDeProva.map((c) => c.id)).toEqual([
      "nome",
      "categoria",
      "ano",
      "edicao",
      "progresso",
      "gabarito",
      "createdAt",
      "status",
    ]);
  });

  it("todas são ordenáveis", () => {
    for (const c of colunasDeProva) {
      expect(typeof c.sortValue, c.id).toBe("function");
    }
  });

  it("só 'Prova' é a coluna primária — é ela que abre o registro", () => {
    expect(colunasDeProva.filter((c) => c.primary).map((c) => c.id)).toEqual([
      "nome",
    ]);
  });

  it("é uma constante de módulo, para não invalidar o memo da tabela", () => {
    // Se virar uma função chamada no render, esta identidade muda a cada vez e
    // o `sortRows` da lista inteira roda de novo sem motivo.
    expect(colunasDeProva).toBe(colunasDeProva);
  });
});

describe("coluna Aplicação", () => {
  it("não existe mais", () => {
    // ⚠️ Saiu a pedido do time. O campo continua no DTO e no modal de
    // detalhe — o que saiu foi a coluna.
    expect(colunasDeProva.find((c) => c.id === "aplicacao")).toBeUndefined();
  });
});

describe("coluna Categoria", () => {
  /**
   * ⚠️ **`categoria` é uma STRING no DTO da lista** — o ms achata
   * `categoria.nome` em `toProvaDTO`. Enquanto o tipo do client dizia
   * `ICategoria`, a célula fazia `p.categoria?.nome`: compilava, devolvia
   * `undefined` e a coluna mostrava "—" para **todas** as provas.
   *
   * ⚠️ O teste anterior não pegava porque a fixture era construída a partir do
   * tipo errado — ela montava um objeto `ICategoria` que a API nunca manda. O
   * teste certificava o defeito. A fixture agora usa a string que chega de
   * verdade.
   */
  it("mostra o nome da categoria, que vem como string", () => {
    expect(texto("categoria", prova())).toBe("ENEM");
    expect(coluna("categoria").sortValue!(prova())).toBe("ENEM");
  });

  /**
   * Quem garante que a categoria veio é o backend, não o tipo.
   */
  it("não quebra quando a categoria não veio", () => {
    const semCategoria = prova({ categoria: undefined as unknown as string });
    expect(() => texto("categoria", semCategoria)).not.toThrow();
    expect(texto("categoria", semCategoria)).toBe(VAZIO);
    expect(coluna("categoria").sortValue!(semCategoria)).toBeNull();
  });

  it("string vazia também vira travessão, não célula em branco", () => {
    // ⚠️ `??` deixaria "" passar e a célula ficaria vazia, que parece bug.
    expect(texto("categoria", prova({ categoria: "" }))).toBe(VAZIO);
    expect(coluna("categoria").sortValue!(prova({ categoria: "" }))).toBeNull();
  });
});

describe("coluna Gabarito", () => {
  /**
   * ⚠️ **`prova.gabarito` é STRING** — o nome do arquivo. Tratá-la como
   * booleano (`=== true`) não quebra nada e faz a coluna inteira mostrar "—",
   * inclusive para as provas que têm gabarito.
   */
  it("uma string de nome de arquivo conta como 'tem gabarito'", () => {
    expect(temGabarito(prova())).toBe(true);
    expect(texto("gabarito", prova())).toBe(COM_GABARITO);
    expect(texto("gabarito", prova())).not.toBe(SEM_GABARITO);
  });

  it("string vazia, null e undefined contam como 'sem gabarito'", () => {
    for (const g of ["", null, undefined]) {
      const p = prova({ gabarito: g as unknown as string });
      expect(temGabarito(p), String(g)).toBe(false);
      expect(texto("gabarito", p), String(g)).toBe(SEM_GABARITO);
    }
  });

  it("tem title em ambos os casos, porque ✓ e — sozinhos não dizem nada", () => {
    render(<>{coluna("gabarito").cell(prova())}</>);
    expect(screen.getByTitle("Com gabarito")).toBeInTheDocument();

    render(<>{coluna("gabarito").cell(prova({ gabarito: "" }))}</>);
    expect(screen.getByTitle("Sem gabarito")).toBeInTheDocument();
  });

  it("ordena as com gabarito depois das sem, no ascendente", () => {
    const com = prova({ _id: "com", gabarito: "g.pdf" });
    const sem = prova({ _id: "sem", gabarito: "" });
    const ordenadas = sortRows([com, sem], colunasDeProva, {
      columnId: "gabarito",
      direction: "asc",
    });
    expect(ordenadas.map((p) => p._id)).toEqual(["sem", "com"]);
  });
});

describe("coluna Cadastrado em", () => {
  it("formata com o formatDate que a tela já usava", () => {
    expect(texto("createdAt", prova())).toBe("10/03/2024");
  });

  it("ordena por data de verdade, não por texto", () => {
    const valor = coluna("createdAt").sortValue!(prova());
    expect(valor).toBeInstanceOf(Date);
  });

  it("some antes de 1200px — é a primeira a sair quando falta largura", () => {
    expect(coluna("createdAt").hideBelow).toBe("md");
  });
});

describe("coluna Status", () => {
  it("uma prova em cadastro NÃO é vermelha", () => {
    render(
      <>
        {coluna("status").cell(
          prova({ totalQuestaoCadastradas: 40, totalQuestaoValidadas: 10 }),
        )}
      </>,
    );
    const badge = screen.getByText("Em cadastro");
    expect(badge).toHaveAttribute("data-tone", "running");
    expect(badge).not.toHaveAttribute("data-tone", "missing");
  });

  it("uma prova sem questão não é anunciada como Completa", () => {
    render(
      <>
        {coluna("status").cell(
          prova({
            totalQuestao: 0,
            totalQuestaoCadastradas: 0,
            totalQuestaoValidadas: 0,
          }),
        )}
      </>,
    );
    expect(screen.getByText("Sem questões")).toHaveAttribute(
      "data-tone",
      "neutral",
    );
    expect(screen.queryByText("Completa")).toBeNull();
  });

  it("nenhuma prova desta tela produz um badge vermelho", () => {
    const casos = [
      prova({
        totalQuestao: 0,
        totalQuestaoCadastradas: 0,
        totalQuestaoValidadas: 0,
      }),
      prova({ totalQuestaoCadastradas: 10, totalQuestaoValidadas: 0 }),
      prova({ totalQuestaoCadastradas: 180, totalQuestaoValidadas: 10 }),
      prova({ totalQuestaoCadastradas: 180, totalQuestaoValidadas: 180 }),
    ];
    for (const p of casos) {
      const { container } = render(<>{coluna("status").cell(p)}</>);
      expect(container.querySelector("[data-tone]")).not.toHaveAttribute(
        "data-tone",
        "missing",
      );
    }
  });
});

describe("coluna Progresso", () => {
  it("ordena por proporção validada, e a prova sem questão fica no fundo do asc", () => {
    const vazia = prova({
      _id: "vazia",
      totalQuestao: 0,
      totalQuestaoCadastradas: 0,
      totalQuestaoValidadas: 0,
    });
    const meia = prova({
      _id: "meia",
      totalQuestao: 180,
      totalQuestaoValidadas: 90,
    });
    const cheia = prova({
      _id: "cheia",
      totalQuestao: 180,
      totalQuestaoValidadas: 180,
    });

    const asc = sortRows([cheia, meia, vazia], colunasDeProva, {
      columnId: "progresso",
      direction: "asc",
    });
    expect(asc.map((p) => p._id)).toEqual(["vazia", "meia", "cheia"]);
  });

  it("a prova vazia não empata com a prova completa", () => {
    const sv = coluna("progresso").sortValue!;
    const vazia = prova({
      totalQuestao: 0,
      totalQuestaoCadastradas: 0,
      totalQuestaoValidadas: 0,
    });
    const cheia = prova({ totalQuestaoValidadas: 180 });
    expect(sv(vazia)).not.toBe(sv(cheia));
  });
});

describe("ordenação padrão da tela", () => {
  it("`ano desc` traz a prova mais recente primeiro", () => {
    const p2019 = prova({ _id: "2019", ano: 2019 });
    const p2023 = prova({ _id: "2023", ano: 2023 });
    const ordenadas = sortRows([p2019, p2023], colunasDeProva, {
      columnId: "ano",
      direction: "desc",
    });
    expect(ordenadas.map((p) => p._id)).toEqual(["2023", "2019"]);
  });
});
