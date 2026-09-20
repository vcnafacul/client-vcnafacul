import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SelectProps } from "@/components/atoms/select";
import type { ButtonProps } from "@/components/molecules/button";
import type { CardDash } from "@/components/molecules/cardDash";
import {
  DashCardContext,
  type DashCardContextProps,
} from "@/context/dashCardContext";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { DEBOUNCE_BUSCA_MS } from "./DashFilterBar";
import {
  DashListTemplate,
  TEXTO_LIMPAR_FILTROS,
  TEXTO_VAZIO_COM_FILTRO,
  TEXTO_VAZIO_SEM_FILTRO,
  type DashListTemplateProps,
} from "./DashListTemplate";
import { LINHAS_SKELETON, TEXTO_TENTAR_DE_NOVO } from "./DashTableEmpty";
import { dashV2 } from "./tokens";
import type { DashColumn } from "./types";

/**
 * ⚠️ O `sm` deste projeto é 768px e o jsdom não implementa `matchMedia` — sem o
 * mock o `DashTable` cai no palpite "desktop" e a lista empilhada do mobile
 * nunca seria exercitada. Aqui todos os testes rodam como desktop, que é onde a
 * tabela e a paginação existem.
 */
function larguraDeTela(acimaDeSm: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      media: query,
      matches: query === "(min-width: 768px)" ? acimaDeSm : !acimaDeSm,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

beforeEach(() => larguraDeTela(true));
afterEach(() => vi.useRealTimers());

/* -------------------------------------------------------------------------- *
 * Fixture — moldada em `dashProvas`, a tela que o ticket `06` migra.
 * -------------------------------------------------------------------------- */

interface Prova {
  _id: string;
  nome: string;
  ano: number;
  cadastradas: number;
}

/**
 * ⚠️ **`id` ≠ `_id` de propósito.** É o que torna verificável o critério "a
 * linha chama `onClickCard` com `cardTransformation(row).id`": com os dois
 * iguais — como acontece em `dashProvas` — passar o `_id` cru passaria no teste.
 */
const cardTransformation = (p: Prova): CardDash => ({
  id: `card-${p._id}`,
  title: p.nome,
  status: p.cadastradas === 0 ? StatusEnum.Rejected : StatusEnum.Approved,
  infos: [
    { field: "Ano", value: String(p.ano) },
    { field: "Cadastradas", value: String(p.cadastradas) },
  ],
});

const provas = (quantidade: number): Prova[] =>
  Array.from({ length: quantidade }, (_, i) => ({
    _id: String(i + 1),
    nome: `Prova ${String(i + 1).padStart(3, "0")}`,
    ano: 2000 + (i % 25),
    cadastradas: i % 7,
  }));

type Ctx = DashCardContextProps<Prova>;

function criarContexto(overrides: Partial<Ctx> = {}): Ctx {
  return {
    title: "Banco de Provas",
    entities: provas(128),
    setEntities: vi.fn(),
    onClickCard: vi.fn(),
    getMoreCards: vi.fn().mockResolvedValue({
      data: [],
      page: 1,
      limit: 25,
      totalItems: 0,
    }),
    cardTransformation,
    limitCards: 500,
    ...overrides,
  };
}

function montar(
  contexto: Ctx = criarContexto(),
  props: DashListTemplateProps<Prova> = {},
) {
  const arvore = (ctx: Ctx, p: DashListTemplateProps<Prova>) => (
    <DashCardContext.Provider value={ctx}>
      <DashListTemplate<Prova> {...p} />
    </DashCardContext.Provider>
  );
  const utils = render(arvore(contexto, props));
  return {
    ...utils,
    contexto,
    remontar: (ctx: Ctx = contexto, p: DashListTemplateProps<Prova> = props) =>
      utils.rerender(arvore(ctx, p)),
  };
}

const rodape = () => screen.queryByTestId("dash-list-footer");
const intervalo = () => rodape()?.querySelector("p")?.textContent;
const nomesVisiveis = () =>
  [...document.querySelectorAll("tbody [data-column-id='title']")].map(
    (el) => el.textContent,
  );
const irPara = (pagina: string) =>
  fireEvent.click(within(rodape()!).getByText(pagina));
/**
 * ⚠️ O "próxima" do `components/ui/pagination` é um `<a>` **sem `href`** com
 * `aria-label="Go to next page"` — rótulo em inglês e sem papel de link (é uma
 * das pendências listadas no README). Consultar por rótulo é o que casa com o
 * que está realmente na tela.
 */
const irParaAProxima = () =>
  fireEvent.click(within(rodape()!).getByLabelText("Go to next page"));

/* -------------------------------------------------------------------------- *
 * O contrato: `entities` é leitura.
 * -------------------------------------------------------------------------- */

describe("DashListTemplate — entities é LEITURA", () => {
  it("nunca chama setEntities nem getMoreCards, faça o usuário o que fizer", () => {
    /**
     * ⚠️ **O critério central do ticket.** No V1 o scroll infinito faz
     * `setEntities([...entities, ...novos])`; nas telas que passam a lista
     * filtrada como `entities` e o setter da lista bruta como `setEntities`,
     * isso **apaga** do estado os registros escondidos pelo filtro. O V2 não
     * pode reintroduzir o bug `08`.
     */
    const filtrar = vi.fn();
    const contexto = criarContexto({
      filterProps: { placeholder: "Buscar", filtrar, defaultValue: "" },
    });
    montar(contexto, { activeFilterCount: 1, onClearFilters: vi.fn() });

    irPara("6");
    fireEvent.click(screen.getByRole("button", { name: /Ano/ }));
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "enem" },
    });
    fireEvent.click(screen.getByText(`${TEXTO_LIMPAR_FILTROS} (1)`));

    expect(contexto.setEntities).not.toHaveBeenCalled();
    expect(contexto.getMoreCards).not.toHaveBeenCalled();
  });
});

/* -------------------------------------------------------------------------- *
 * Clique na linha.
 * -------------------------------------------------------------------------- */

describe("DashListTemplate — clique", () => {
  it("chama onClickCard com cardTransformation(row).id, não com o id cru da entidade", () => {
    const contexto = criarContexto({ entities: provas(3) });
    montar(contexto);

    fireEvent.click(screen.getByRole("button", { name: "Prova 001" }));

    expect(contexto.onClickCard).toHaveBeenCalledTimes(1);
    expect(contexto.onClickCard).toHaveBeenCalledWith("card-1");
    // Redundante de propósito: é o valor que a mutação óbvia produziria.
    expect(contexto.onClickCard).not.toHaveBeenCalledWith("1");
  });

  it("clicar na linha inteira dispara a ação uma única vez", () => {
    const contexto = criarContexto({ entities: provas(3) });
    const { container } = montar(contexto);

    fireEvent.click(container.querySelector("tbody [data-row-key]")!);

    expect(contexto.onClickCard).toHaveBeenCalledTimes(1);
    expect(contexto.onClickCard).toHaveBeenCalledWith("card-1");
  });

  it("a chave da linha também é o id do card — nunca o índice", () => {
    const { container } = montar(criarContexto({ entities: provas(3) }));
    expect(
      [...container.querySelectorAll("tbody [data-row-key]")].map((el) =>
        el.getAttribute("data-row-key"),
      ),
    ).toEqual(["card-1", "card-2", "card-3"]);
  });
});

/* -------------------------------------------------------------------------- *
 * Paginação.
 * -------------------------------------------------------------------------- */

describe("DashListTemplate — paginação", () => {
  it("pageSize padrão é 25 e o rodapé conta o conjunto inteiro", () => {
    montar();
    expect(nomesVisiveis()).toHaveLength(25);
    expect(intervalo()).toBe("Mostrando 1–25 de 128");
  });

  it("⚠️ na última página o rodapé para no total: 126–128, não 126–150", () => {
    montar();
    irPara("6");

    expect(intervalo()).toBe("Mostrando 126–128 de 128");
    expect(nomesVisiveis()).toEqual(["Prova 126", "Prova 127", "Prova 128"]);
  });

  it("a página exibida é a fatia certa do conjunto", () => {
    montar(criarContexto({ entities: provas(40) }), { pageSize: 10 });
    irPara("4");
    expect(nomesVisiveis()).toEqual([
      "Prova 031",
      "Prova 032",
      "Prova 033",
      "Prova 034",
      "Prova 035",
      "Prova 036",
      "Prova 037",
      "Prova 038",
      "Prova 039",
      "Prova 040",
    ]);
  });

  it("nenhuma requisição é disparada ao trocar de página", () => {
    const contexto = criarContexto();
    montar(contexto);
    irPara("6");
    expect(contexto.getMoreCards).not.toHaveBeenCalled();
  });

  it("paginar não perde a ordenação nem o texto da busca", () => {
    const contexto = criarContexto({
      entities: provas(40),
      filterProps: { placeholder: "Buscar", filtrar: vi.fn(), defaultValue: "pro" },
    });
    montar(contexto, { pageSize: 10, defaultSort: { columnId: "title", direction: "desc" } });

    irPara("2");

    expect(nomesVisiveis()[0]).toBe("Prova 030");
    expect(screen.getByRole("searchbox")).toHaveValue("pro");
  });

  it("o conjunto encolhendo por baixo dos pés não deixa a tela numa página que não existe", () => {
    // ⚠️ Rede para o filtro que o template não intercepta (o `filters` da tela).
    const contexto = criarContexto({ entities: provas(128) });
    const { remontar } = montar(contexto, { pageSize: 25 });
    irPara("6");
    expect(intervalo()).toBe("Mostrando 126–128 de 128");

    remontar(criarContexto({ ...contexto, entities: provas(30) }));

    expect(intervalo()).toBe("Mostrando 26–30 de 30");
    expect(nomesVisiveis().length).toBeGreaterThan(0);
  });
});

/* -------------------------------------------------------------------------- *
 * Página inicial restaurada, e o aviso de troca de página.
 * -------------------------------------------------------------------------- */

describe("DashListTemplate — paginaInicial e onPaginaChange", () => {
  it("paginaInicial abre na página pedida", () => {
    // 60 registros, 25 por página → 3 páginas; a 3ª é 51–60.
    montar(criarContexto({ entities: provas(60) }), { paginaInicial: 3 });

    expect(intervalo()).toBe("Mostrando 51–60 de 60");
    expect(nomesVisiveis()[0]).toBe("Prova 051");
  });

  it("sem paginaInicial o comportamento é o de hoje: página 1", () => {
    montar(criarContexto({ entities: provas(60) }));

    expect(intervalo()).toBe("Mostrando 1–25 de 60");
  });

  it("⚠️ paginaInicial sobrevive ao render com a lista ainda carregando", () => {
    /**
     * ⚠️ A linha do clamp roda **durante** o render, e `totalDePaginas(0, n)`
     * devolve 1 (`paginacao.ts` garante "nunca zero"). Sem o guard por
     * `state`, a página restaurada é zerada antes de as linhas chegarem — e o
     * primeiro teste deste bloco passa mesmo assim, porque lá a lista já está
     * cheia no primeiro render.
     */
    const { remontar } = montar(criarContexto({ entities: [] }), {
      paginaInicial: 3,
      state: "loading",
    });
    // Enquanto carrega o rodapé nem existe: o estado da página não pode ter
    // sido corrigido por nada que a tela mostre.
    expect(rodape()).toBeNull();

    remontar(criarContexto({ entities: provas(60) }), {
      paginaInicial: 3,
      state: "idle",
    });

    expect(intervalo()).toBe("Mostrando 51–60 de 60");
    expect(nomesVisiveis()[0]).toBe("Prova 051");
  });

  it("onPaginaChange avisa a navegação pelo rodapé — e só ela", () => {
    const onPaginaChange = vi.fn();
    const contexto = criarContexto({ entities: provas(60) });
    const { remontar } = montar(contexto, {
      onPaginaChange,
      activeFilterCount: 0,
    });

    // Montar não é navegar: ninguém escolheu página nenhuma ainda.
    expect(onPaginaChange).not.toHaveBeenCalled();

    irParaAProxima();
    expect(onPaginaChange).toHaveBeenCalledWith(2);

    irPara("3");
    expect(onPaginaChange).toHaveBeenLastCalledWith(3);
    expect(onPaginaChange).toHaveBeenCalledTimes(2);

    /**
     * ⚠️ O reset por filtro **não** avisa: a pessoa não escolheu a página 1,
     * o template é que a devolveu para lá. Avisar aqui faria a tela guardar
     * como "escolhida" uma página que ninguém pediu.
     */
    remontar(contexto, { onPaginaChange, activeFilterCount: 1 });
    expect(intervalo()).toBe("Mostrando 1–25 de 60");
    expect(onPaginaChange).toHaveBeenCalledTimes(2);

    /**
     * ⚠️ Nem o clamp: a lista encolheu sozinha, não houve navegação. (E um
     * `onPaginaChange` disparado daqui rodaria durante o render.)
     */
    irPara("3");
    expect(onPaginaChange).toHaveBeenCalledTimes(3);
    remontar(criarContexto({ ...contexto, entities: provas(10) }), {
      onPaginaChange,
      activeFilterCount: 1,
    });
    expect(intervalo()).toBe("Mostrando 1–10 de 10");
    expect(onPaginaChange).toHaveBeenCalledTimes(3);
  });

  it("o clamp continua valendo quando a lista encolhe de verdade", () => {
    // A rede de segurança original não pode ter sido desligada junto.
    const contexto = criarContexto({ entities: provas(60) });
    const { remontar } = montar(contexto, { paginaInicial: 3 });
    expect(intervalo()).toBe("Mostrando 51–60 de 60");

    remontar(criarContexto({ ...contexto, entities: provas(10) }), {
      paginaInicial: 3,
      state: "idle",
    });

    expect(intervalo()).toBe("Mostrando 1–10 de 10");
    expect(nomesVisiveis().length).toBe(10);
  });
});

/* -------------------------------------------------------------------------- *
 * Trocar filtro volta para a página 1.
 * -------------------------------------------------------------------------- */

describe("DashListTemplate — trocar filtro volta para a página 1", () => {
  it("⚠️ mudar o activeFilterCount reposiciona na página 1", () => {
    /**
     * ⚠️ O conjunto **não** muda de tamanho aqui: 40 registros antes e depois,
     * 4 páginas nas duas vezes. Só o reset explica voltar para a página 1 — o
     * clamp de página inexistente não tem como.
     */
    const contexto = criarContexto({ entities: provas(40) });
    const { remontar } = montar(contexto, { pageSize: 10, activeFilterCount: 0 });

    irPara("4");
    expect(intervalo()).toBe("Mostrando 31–40 de 40");

    remontar(contexto, { pageSize: 10, activeFilterCount: 1 });

    expect(intervalo()).toBe("Mostrando 1–10 de 40");
  });

  it("⚠️ digitar na busca reposiciona na página 1 no mesmo instante em que a tela filtra", () => {
    vi.useFakeTimers();
    const filtrar = vi.fn();
    const contexto = criarContexto({
      entities: provas(40),
      filterProps: { placeholder: "Buscar por nome", filtrar, defaultValue: "" },
    });
    montar(contexto, { pageSize: 10 });

    irPara("4");
    expect(intervalo()).toBe("Mostrando 31–40 de 40");

    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "pro" } });
    act(() => vi.advanceTimersByTime(DEBOUNCE_BUSCA_MS + 10));

    expect(filtrar).toHaveBeenCalledTimes(1);
    expect(filtrar.mock.calls[0][0].target.value).toBe("pro");
    expect(intervalo()).toBe("Mostrando 1–10 de 40");
  });

  it("⚠️ mudar um select reposiciona na página 1 e repassa o valor à tela", () => {
    const setState = vi.fn();
    const selectFiltes: SelectProps[] = [
      {
        options: [
          { id: "", name: "Todos os anos" },
          { id: "2019", name: "2019" },
        ],
        defaultValue: "",
        setState,
      },
    ];
    montar(criarContexto({ entities: provas(40), selectFiltes }), { pageSize: 10 });

    irPara("4");
    fireEvent.change(screen.getByLabelText("Todos os anos"), {
      target: { value: "2019" },
    });

    expect(setState).toHaveBeenCalledWith("2019");
    expect(intervalo()).toBe("Mostrando 1–10 de 40");
  });

  it("ordenar também recomeça da primeira página", () => {
    montar(criarContexto({ entities: provas(40) }), { pageSize: 10 });
    irPara("4");
    fireEvent.click(screen.getByRole("button", { name: /Ano/ }));
    expect(intervalo()).toBe("Mostrando 1–10 de 40");
  });
});

/* -------------------------------------------------------------------------- *
 * Limpar filtros sem remontar.
 * -------------------------------------------------------------------------- */

describe("DashListTemplate — limpar filtros", () => {
  it("resolve sem remontar: a ordenação sobrevive e a página volta a ser a 1", () => {
    /**
     * ⚠️ O `key={resetKey}` que `dashProvas` usa hoje remonta o template
     * inteiro — e remontar joga fora a ordenação e a posição de scroll. A
     * ordenação continuar de pé depois do "Limpar filtros" é a prova de que
     * não houve remontagem.
     */
    const onClearFilters = vi.fn();
    montar(criarContexto({ entities: provas(40) }), {
      pageSize: 10,
      activeFilterCount: 2,
      onClearFilters,
      defaultSort: { columnId: "title", direction: "desc" },
    });

    irPara("4");
    fireEvent.click(screen.getByText(`${TEXTO_LIMPAR_FILTROS} (2)`));

    expect(onClearFilters).toHaveBeenCalledTimes(1);
    expect(intervalo()).toBe("Mostrando 1–10 de 40");
    // desc preservado: a primeira linha continua sendo a última prova.
    expect(nomesVisiveis()[0]).toBe("Prova 040");
  });

  it("o select acompanha o clearFilters da tela sem key de remontagem", () => {
    /**
     * ⚠️ Select não controlado ignora a mudança de estado da tela e continua
     * exibindo a opção antiga com a lista já refiltrada — a interface mentindo
     * sobre o filtro ativo. É por isso que o `FiltroSelect` é controlado.
     */
    const opcoes = [
      { id: "", name: "Todos os anos" },
      { id: "2019", name: "2019" },
    ];
    const contexto = criarContexto({
      entities: provas(4),
      selectFiltes: [{ options: opcoes, defaultValue: "2019", setState: vi.fn() }],
    });
    const { remontar } = montar(contexto);

    expect(screen.getByLabelText("Todos os anos")).toHaveValue("2019");

    remontar(
      criarContexto({
        ...contexto,
        selectFiltes: [{ options: opcoes, defaultValue: "", setState: vi.fn() }],
      }),
    );

    expect(screen.getByLabelText("Todos os anos")).toHaveValue("");
  });
});

/* -------------------------------------------------------------------------- *
 * Vazio.
 * -------------------------------------------------------------------------- */

describe("DashListTemplate — vazio", () => {
  it("⚠️ com filtro ativo a mensagem fala em filtro e oferece limpar", () => {
    const onClearFilters = vi.fn();
    montar(criarContexto({ entities: [] }), {
      activeFilterCount: 2,
      onClearFilters,
    });

    expect(screen.getByText(TEXTO_VAZIO_COM_FILTRO)).toBeInTheDocument();
    expect(screen.queryByText(TEXTO_VAZIO_SEM_FILTRO)).toBeNull();

    fireEvent.click(
      within(screen.getByTestId("dash-list-vazio")).getByText(TEXTO_LIMPAR_FILTROS),
    );
    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });

  it("⚠️ sem filtro a mensagem fala em nada cadastrado e não oferece limpar", () => {
    montar(criarContexto({ entities: [] }), {
      activeFilterCount: 0,
      onClearFilters: vi.fn(),
    });

    expect(screen.getByText(TEXTO_VAZIO_SEM_FILTRO)).toBeInTheDocument();
    expect(screen.queryByText(TEXTO_VAZIO_COM_FILTRO)).toBeNull();
    expect(
      within(screen.getByTestId("dash-list-vazio")).queryByText(TEXTO_LIMPAR_FILTROS),
    ).toBeNull();
  });

  it("sem registro nenhum o rodapé some, em vez de anunciar 'Mostrando 0–0 de 0'", () => {
    montar(criarContexto({ entities: [] }));
    expect(rodape()).toBeNull();
  });

  it("a tabela continua com cabeçalho utilizável mesmo vazia", () => {
    montar(criarContexto({ entities: [] }));
    expect(screen.getByTestId("dash-table")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Status/ })).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- *
 * Estados.
 * -------------------------------------------------------------------------- */

describe("DashListTemplate — estados", () => {
  it("loading mostra skeleton, não tela em branco nem rodapé do estado anterior", () => {
    montar(criarContexto({ entities: [] }), { state: "loading" });

    expect(screen.getAllByTestId("dash-table-skeleton-row")).toHaveLength(
      LINHAS_SKELETON,
    );
    expect(screen.queryByTestId("dash-list-vazio")).toBeNull();
    expect(rodape()).toBeNull();
  });

  it("erro mostra a faixa com retentar e não mostra linhas", () => {
    const onRetry = vi.fn();
    montar(criarContexto(), { state: "error", onRetry });

    expect(nomesVisiveis()).toEqual([]);
    fireEvent.click(screen.getByText(TEXTO_TENTAR_DE_NOVO));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

/* -------------------------------------------------------------------------- *
 * Drop-in: nenhuma coluna, nenhuma ação escrita à mão.
 * -------------------------------------------------------------------------- */

describe("DashListTemplate — drop-in sobre o contexto do V1", () => {
  it("sem columns, deriva a tabela do cardTransformation da tela", () => {
    montar(criarContexto({ entities: provas(3) }));

    expect(
      screen.getAllByRole("columnheader").map((th) => th.textContent),
    ).toEqual(["Nome", "Ano", "Cadastradas", "Status"]);

    const primeira = document.querySelector("tbody [data-row-key='card-1']")!;
    expect(
      within(primeira as HTMLElement).getByRole("button").textContent,
    ).toBe("Prova 001");
    expect(
      within(primeira as HTMLElement).getByText("Rejeitado"),
    ).toHaveAttribute("data-tone", "missing");
  });

  it("sem actions, os buttons do contexto viram a barra de ações", () => {
    const sincronizar = vi.fn();
    const buttons: ButtonProps[] = [
      { children: "Relatorio Sync", typeStyle: "secondary", onClick: vi.fn() },
      { children: "Sincronizar", typeStyle: "primary", onClick: sincronizar },
      { children: "Limpar filtros", typeStyle: "refused", onClick: vi.fn() },
    ];
    montar(criarContexto({ entities: provas(3), buttons }));

    const barra = screen.getByTestId("dash-toolbar");
    const primaria = within(barra).getByRole("button", { name: "Sincronizar" });
    expect(primaria.className).toContain(dashV2.action.primary);
    fireEvent.click(primaria);
    expect(sincronizar).toHaveBeenCalledTimes(1);

    // ⚠️ "Limpar filtros" como ação destrutiva é o retrato fiel do V1 — o
    // fallback traduz o `typeStyle`, ele não conserta a classificação. É o
    // ticket `06` que reclassifica à mão.
    expect(
      within(barra).getByRole("button", { name: "Limpar filtros" }).className,
    ).toContain(dashV2.action.destructive);
  });

  it("actions explícitas desligam o fallback por inteiro", () => {
    const buttons: ButtonProps[] = [
      { children: "Do contexto", typeStyle: "primary", onClick: vi.fn() },
    ];
    montar(criarContexto({ entities: provas(3), buttons }), {
      actions: { primary: { id: "nova", label: "Nova prova", onClick: vi.fn() } },
    });

    const barra = screen.getByTestId("dash-toolbar");
    expect(within(barra).getByRole("button", { name: "Nova prova" })).toBeInTheDocument();
    expect(within(barra).queryByRole("button", { name: "Do contexto" })).toBeNull();
  });

  it("columns explícitas têm precedência sobre a derivação", () => {
    const columns: DashColumn<Prova>[] = [
      { id: "nome", header: "Prova", cell: (r) => r.nome, primary: true },
    ];
    montar(criarContexto({ entities: provas(2) }), { columns });

    expect(
      screen.getAllByRole("columnheader").map((th) => th.textContent),
    ).toEqual(["Prova"]);
  });

  it("o subtítulo conta os registros do conjunto", () => {
    montar(criarContexto({ entities: provas(128) }));
    expect(within(screen.getByTestId("dash-toolbar")).getByText("128 registros"))
      .toBeInTheDocument();
  });

  it("singular no subtítulo com um registro só", () => {
    montar(criarContexto({ entities: provas(1) }));
    expect(within(screen.getByTestId("dash-toolbar")).getByText("1 registro"))
      .toBeInTheDocument();
  });

  it("sem filtro algum a faixa de filtros nem aparece", () => {
    montar(criarContexto({ entities: provas(3) }));
    expect(screen.queryByTestId("dash-filter-bar")).toBeNull();
  });

  it("o headerSlot entra entre os filtros e a tabela", () => {
    montar(criarContexto({ entities: provas(3) }), {
      headerSlot: <div data-testid="cabecalho-da-tela">resumo</div>,
    });
    expect(screen.getByTestId("cabecalho-da-tela")).toBeInTheDocument();
  });

  it("os filtros próprios da tela entram na faixa, ao lado dos selects", () => {
    montar(criarContexto({ entities: provas(3) }), {
      filters: <label data-testid="so-com-gabarito">Só com gabarito</label>,
    });
    expect(
      within(screen.getByTestId("dash-filter-bar")).getByTestId("so-com-gabarito"),
    ).toBeInTheDocument();
  });
});

/* -------------------------------------------------------------------------- *
 * Ordenação.
 * -------------------------------------------------------------------------- */

describe("DashListTemplate — ordenação", () => {
  it("defaultSort já chega aplicado e anunciado no cabeçalho", () => {
    montar(criarContexto({ entities: provas(5) }), {
      defaultSort: { columnId: "title", direction: "desc" },
    });

    expect(nomesVisiveis()).toEqual([
      "Prova 005",
      "Prova 004",
      "Prova 003",
      "Prova 002",
      "Prova 001",
    ]);
    expect(screen.getByRole("columnheader", { name: /Nome/ })).toHaveAttribute(
      "aria-sort",
      "descending",
    );
  });

  it("clicar no cabeçalho ordena em memória, sem tocar em entities", () => {
    const contexto = criarContexto({ entities: provas(5) });
    montar(contexto);

    fireEvent.click(screen.getByRole("button", { name: /Nome/ }));
    expect(nomesVisiveis()[0]).toBe("Prova 001");

    fireEvent.click(screen.getByRole("button", { name: /Nome/ }));
    expect(nomesVisiveis()[0]).toBe("Prova 005");

    // ⚠️ `sortRows` é puro: o array da tela continua na ordem original.
    expect(contexto.entities.map((p) => p.nome)[0]).toBe("Prova 001");
    expect(contexto.setEntities).not.toHaveBeenCalled();
  });

  it("a coluna numérica derivada ordena por número, não por texto", () => {
    // "10" < "9" como texto; 10 > 9 como número.
    const entities: Prova[] = [
      { _id: "a", nome: "A", ano: 2019, cadastradas: 9 },
      { _id: "b", nome: "B", ano: 2019, cadastradas: 10 },
    ];
    montar(criarContexto({ entities }));

    fireEvent.click(screen.getByRole("button", { name: /Cadastradas/ }));
    expect(nomesVisiveis()).toEqual(["A", "B"]);
  });
});

/* -------------------------------------------------------------------------- *
 * Tipagem.
 * -------------------------------------------------------------------------- */

describe("DashListTemplate — tipagem", () => {
  it("uma coluna que acessa campo inexistente não compila", () => {
    /**
     * ⚠️ `@ts-expect-error` **falha o build se o erro não acontecer** — é o
     * jeito de testar tipo em tempo de compilação. Este arquivo está sob
     * `include: ["src"]` do `tsconfig.json`, então o `tsc` do `yarn build`
     * passa por aqui.
     */
    const coluna: DashColumn<Prova> = {
      id: "x",
      header: "X",
      // @ts-expect-error `Prova` não tem `naoExiste`
      cell: (row) => row.naoExiste,
    };
    expect(coluna.id).toBe("x");
  });
});
