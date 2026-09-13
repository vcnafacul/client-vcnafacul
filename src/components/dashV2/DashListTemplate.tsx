import { Inbox } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { SelectProps } from "@/components/atoms/select";
import {
  useDashCardContext,
  type DashCardContextProps,
} from "@/context/dashCardContext";
import { cn } from "@/lib/utils";
import { DashFilterBar } from "./DashFilterBar";
import { DashListFooter } from "./DashListFooter";
import { DashTable } from "./DashTable";
import { DashToolbar } from "./DashToolbar";
import { deriveActions } from "./deriveActions";
import { deriveColumns } from "./deriveColumns";
import { totalDePaginas } from "./paginacao";
import { sortRows } from "./sortRows";
import { dashV2 } from "./tokens";
import type { DashAction, DashColumn, SortState } from "./types";

/**
 * ⚠️ 25 com linha de 40px dá ~1000px de tabela — cerca de uma tela, sem exigir
 * scroll para saber quantos registros a página tem. 50 obrigaria a rolar duas
 * vezes só para chegar ao rodapé.
 */
export const PAGE_SIZE_PADRAO = 25;

export const TEXTO_VAZIO_SEM_FILTRO = "Nenhum registro cadastrado";
export const TEXTO_VAZIO_COM_FILTRO = "Nenhum registro com os filtros atuais";
export const DICA_VAZIO_COM_FILTRO =
  "Nenhum dos registros existentes atende à combinação de filtros aplicada.";
export const TEXTO_LIMPAR_FILTROS = "Limpar filtros";

export interface DashListTemplateProps<T> {
  /**
   * Ausente: derivadas do `cardTransformation` do contexto — ver
   * `deriveColumns`. É o que faz a migração caber num `import`.
   */
  columns?: DashColumn<T>[];
  /**
   * Ausente: derivadas dos `buttons` do contexto — ver `deriveActions`.
   * ⚠️ Tudo ou nada: passar `actions` desliga o fallback inteiro, inclusive
   * para os campos que ficaram vazios. Meia-derivação seria impossível de
   * prever ao ler a tela.
   */
  actions?: {
    primary?: DashAction;
    secondary?: DashAction[];
    overflow?: DashAction[];
  };
  /** Controles extras dentro da faixa de filtros — checkbox, toggle, o que for. */
  filters?: React.ReactNode;
  /** Sem isto, "Limpar filtros" não aparece e o vazio não sabe falar de filtro. */
  activeFilterCount?: number;
  onClearFilters?: () => void;
  defaultSort?: SortState;
  density?: "base" | "compact";
  /** Padrão: {@link PAGE_SIZE_PADRAO}. */
  pageSize?: number;
  state?: "idle" | "loading" | "error";
  onRetry?: () => void;
  backButton?: React.ReactNode;
  /** Equivalente ao `headerDash` do V1 — entra entre os filtros e a tabela. */
  headerSlot?: React.ReactNode;
}

/**
 * ⚠️ **Select próprio, e não o `atoms/select` do V1.** O do V1 tem 48px de
 * altura (numa faixa de controles de 36px), sombra, e anel de foco azul — o
 * `blue-500` que o `tokens.ts` existe para substituir. São 15 linhas para não
 * arrastar isso para dentro do V2.
 *
 * ⚠️ **Controlado**, mesmo quando a tela passa `defaultValue`. É isto que faz o
 * `clearFilters` funcionar sem `key={resetKey}`: um select não controlado
 * ignora a mudança de estado da tela e continua mostrando a opção antiga
 * enquanto a lista já foi refiltrada — a interface mentindo sobre o filtro
 * ativo.
 */
function FiltroSelect({
  select,
  onChange,
}: {
  select: SelectProps;
  onChange: (valor: string) => void;
}) {
  const valor = select.value ?? select.defaultValue ?? "";
  return (
    <select
      // ⚠️ `SelectProps` não tem rótulo. A primeira opção de todos os selects
      // das telas é a opção "todos" ("Todas edições", "Todos os anos"), que
      // descreve o filtro melhor do que qualquer texto genérico.
      aria-label={
        select["aria-label"] ?? String(select.options[0]?.name ?? "Filtro")
      }
      disabled={select.disabled}
      value={String(valor)}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-9 max-w-[12rem] rounded-md border px-2 text-sm",
        dashV2.border,
        dashV2.surface,
        dashV2.text.primary,
        dashV2.focus,
      )}
    >
      {select.options.map((opcao) => (
        <option key={String(opcao.id)} value={String(opcao.id)}>
          {opcao.name}
        </option>
      ))}
    </select>
  );
}

/**
 * ⚠️ Vazio **por filtro** e vazio **por não existir nada** são telas
 * diferentes: uma pede que se remova filtro, a outra que se crie o primeiro
 * registro. Oferecer "Limpar filtros" a quem nunca cadastrou nada manda a
 * pessoa procurar um filtro que não existe.
 */
function VazioDaLista({
  comFiltro,
  onClearFilters,
}: {
  comFiltro: boolean;
  onClearFilters?: () => void;
}) {
  return (
    <div
      data-testid="dash-list-vazio"
      className="flex flex-col items-center gap-2 px-4 py-10 text-center"
    >
      <Inbox aria-hidden="true" className={cn("h-8 w-8", dashV2.text.muted)} />
      <p className={cn("text-sm font-medium", dashV2.text.primary)}>
        {comFiltro ? TEXTO_VAZIO_COM_FILTRO : TEXTO_VAZIO_SEM_FILTRO}
      </p>
      {comFiltro ? (
        <>
          <p className={cn("text-xs", dashV2.text.secondary)}>
            {DICA_VAZIO_COM_FILTRO}
          </p>
          {onClearFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className={cn(
                "rounded-sm text-sm font-medium underline-offset-2 hover:underline",
                dashV2.text.primary,
                dashV2.focus,
              )}
            >
              {TEXTO_LIMPAR_FILTROS}
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

/**
 * A dash V2: mesma `DashCardContext.Provider`, outra tela.
 *
 * ```tsx
 * // antes
 * <DashCardTemplate key={resetKey} customFilter={[GabaritoCheckbox]} />
 * // depois — mesmo Provider acima, mesmos dados
 * <DashListTemplate<Prova> filters={GabaritoCheckbox} />
 * ```
 *
 * ## ⚠️ O contrato que muda tudo: `entities` é LEITURA
 *
 * **O template nunca chama `setEntities`.** Quem manda no estado da lista é a
 * tela; aqui `entities` é o conjunto inteiro, já filtrado por ela, e este
 * componente só ordena e fatia em páginas — em memória, sem disparar nenhuma
 * requisição.
 *
 * ⚠️ **Por que isso importa, medido:** o scroll infinito do V1 faz
 * `setEntities([...entities, ...novos])`. Nas telas que passam `entities:
 * <lista filtrada>` junto com `setEntities: <setter da lista bruta>` — e são
 * duas — os registros escondidos pelo filtro são **apagados do estado**, não
 * escondidos: só um F5 os traz de volta. É o bug `08`, e o V2 não o
 * reintroduz. Há teste com spy para `setEntities` e `getMoreCards`.
 *
 * ## Paginação
 *
 * ⚠️ Numerada, não infinita — mudança consciente em relação ao V1, explicada no
 * `DashListFooter`. Hoje **só existe o comportamento cliente**: `entities` é o
 * conjunto completo. A paginação server-side (`getMoreCards(page)` +
 * `totalItems`, com ordenação no servidor) chega com o ticket `10`; até lá a
 * prop `mode` não existe de propósito — um modo que meio-funciona parece
 * feature pronta e não teria como ser validado.
 *
 * ## Nada do V1 é tocado
 *
 * O contexto, o `DashCardTemplate`, o `CardDash` e os átomos de filtro seguem
 * exatamente como estão: este arquivo só os **lê**. Voltar o `import` para
 * `DashCardTemplate` restaura o comportamento antigo por inteiro.
 *
 * ⚠️ `cardTransformation` é chamado uma vez por célula, sem cache. Cachear por
 * entidade economizaria chamadas de uma função barata e criaria uma janela para
 * a tabela mostrar dados velhos quando a tela mutar a entidade no lugar — que é
 * exatamente o modo de falha que este épico combate.
 */
export function DashListTemplate<T>({
  columns,
  actions,
  filters,
  activeFilterCount = 0,
  onClearFilters,
  defaultSort,
  density = "base",
  pageSize = PAGE_SIZE_PADRAO,
  state = "idle",
  onRetry,
  backButton,
  headerSlot,
}: DashListTemplateProps<T>) {
  // ⚠️ O hook do V1 não é genérico (`DashCardContextProps<any>`). O cast é o
  // preço de não tocar no arquivo do contexto — e é seguro porque quem escolhe
  // o `T` é a mesma tela que montou o Provider.
  const contexto = useDashCardContext() as DashCardContextProps<T>;
  const { title, entities, onClickCard, cardTransformation } = contexto;
  const { filterProps, selectFiltes, buttons } = contexto;

  const [sort, setSort] = useState<SortState | undefined>(defaultSort);
  const [pagina, setPagina] = useState(1);

  const colunas = useMemo(
    () => columns ?? deriveColumns(entities, cardTransformation),
    [columns, entities, cardTransformation],
  );

  const linhas = useMemo(
    () => sortRows(entities, colunas, sort),
    [entities, colunas, sort],
  );

  /**
   * ⚠️ **Trocar filtro volta para a página 1.** Sem isto o usuário filtra
   * estando na página 4, o conjunto passa a ter 2 páginas e a tela responde
   * "nenhum registro" — que é falso.
   *
   * O reset acontece em três lugares, porque são três formas de mexer em
   * filtro: a busca e os selects que este template mesmo renderiza (ele
   * embrulha os callbacks), o "Limpar filtros", e — para o `filters` que a tela
   * controla e o template não enxerga — a mudança do `activeFilterCount`.
   *
   * Ajuste de estado durante o render, que é o padrão do React para "estado
   * derivado de prop": o `useEffect` equivalente pintaria uma vez a página 4
   * vazia antes de corrigir.
   */
  const contagemAnterior = useRef(activeFilterCount);
  if (contagemAnterior.current !== activeFilterCount) {
    contagemAnterior.current = activeFilterCount;
    setPagina(1);
  }

  const paginas = totalDePaginas(linhas.length, pageSize);
  /**
   * ⚠️ Rede de segurança para o filtro que o template não intercepta: se o
   * conjunto encolheu, a página corrente pode não existir mais. Corrige o
   * estado (para não voltar sozinha à página 9 quando o filtro sair) **e**
   * usa o valor já corrigido neste mesmo render.
   */
  if (pagina > paginas) setPagina(paginas);
  const paginaAtual = Math.min(pagina, paginas);

  const inicio = (paginaAtual - 1) * pageSize;
  const linhasDaPagina = useMemo(
    () => linhas.slice(inicio, inicio + pageSize),
    [linhas, inicio, pageSize],
  );

  const voltarParaPrimeiraPagina = () => setPagina(1);

  const acoesDoContexto = useMemo(() => deriveActions(buttons), [buttons]);
  const acoes = actions ?? {
    primary: acoesDoContexto.primary,
    secondary: acoesDoContexto.secondary,
    overflow: [],
  };

  /**
   * ⚠️ A ponte da busca. `FilterProps.filtrar` é um `ChangeEventHandler` e a
   * `DashFilterBar` entrega o texto já debounced — o evento sintético existe
   * só para caber na assinatura do V1, e todas as nove telas leem apenas
   * `e.target.value`. Uma tela que precise do evento inteiro passa a busca por
   * `filters`.
   *
   * ⚠️ O `defaultValue` do V1 vira `value`: é o que faz o campo acompanhar o
   * `clearFilters` sem remontar o template.
   */
  const busca = filterProps
    ? {
        value: String(filterProps.defaultValue ?? ""),
        placeholder: filterProps.placeholder,
        onChange: (valor: string) => {
          voltarParaPrimeiraPagina();
          filterProps.filtrar({
            target: { value: valor },
          } as React.ChangeEvent<HTMLInputElement>);
        },
      }
    : undefined;

  const limparFiltros = onClearFilters
    ? () => {
        voltarParaPrimeiraPagina();
        onClearFilters();
      }
    : undefined;

  const temFiltros =
    !!busca || !!selectFiltes?.length || !!filters || activeFilterCount > 0;

  const totalDeRegistros = entities.length;

  return (
    <div className={cn("min-h-[calc(100vh-76px)]", dashV2.page)}>
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-4 py-6">
        {/*
          ⚠️ Toolbar e filtros num bloco só. As duas peças trazem `border-b`
          próprio; soltas com `gap-4` virariam duas faixas flutuantes com uma
          linha no pé. O `[&>:last-child]:border-b-0` tira a linha duplicada
          contra a borda do bloco.
        */}
        <div
          className={cn(
            "overflow-hidden rounded-md border [&>:last-child]:border-b-0",
            dashV2.surface,
            dashV2.border,
          )}
        >
          <DashToolbar
            title={title}
            subtitle={`${totalDeRegistros} ${
              totalDeRegistros === 1 ? "registro" : "registros"
            }`}
            primary={acoes.primary}
            secondary={acoes.secondary}
            overflow={acoes.overflow}
            backButton={backButton}
          />
          {temFiltros ? (
            <DashFilterBar
              search={busca}
              activeCount={activeFilterCount}
              onClear={limparFiltros}
            >
              {selectFiltes?.map((select, indice) => (
                <FiltroSelect
                  key={indice}
                  select={select}
                  onChange={(valor) => {
                    voltarParaPrimeiraPagina();
                    select.setState(valor);
                  }}
                />
              ))}
              {filters}
            </DashFilterBar>
          ) : null}
        </div>

        {headerSlot}

        {/*
          ⚠️ **Sem `overflow-hidden` aqui**, apesar de o desenho do ticket
          trazer. `overflow` — inclusive `hidden` — transforma o elemento no
          scrollport do `position: sticky` de dentro dele: o cabeçalho da
          `DashTable` passaria a grudar num bloco que nunca rola, ou seja,
          deixaria de grudar em silêncio. O bloco já é branco, então a tabela
          encostar nos cantos arredondados não aparece.
        */}
        <div className={cn("rounded-md border", dashV2.surface, dashV2.border)}>
          <DashTable<T>
            rows={linhasDaPagina}
            columns={colunas}
            /* ⚠️ O mesmo `id` que o V1 usa no clique — ver `onRowClick`. */
            rowKey={(row) => cardTransformation(row).id}
            /**
             * ⚠️ **`cardTransformation(row).id`, não o `_id` cru.** Em
             * `dashProvas` os dois coincidem, mas nem toda tela mapeia
             * identidade assim, e `onClickCard` foi escrito esperando o id do
             * card. Passar outra coisa abre a modal do registro errado — ou de
             * nenhum — sem erro nenhum no console. Há teste.
             */
            onRowClick={(row) => onClickCard(cardTransformation(row).id)}
            sort={sort}
            onSortChange={(novo) => {
              setSort(novo);
              // Reordenar com a página 4 aberta mostra as linhas 76–100 de uma
              // ordem que o usuário nunca viu do começo.
              voltarParaPrimeiraPagina();
            }}
            density={density}
            state={state}
            onRetry={onRetry}
            emptyState={
              <VazioDaLista
                comFiltro={activeFilterCount > 0}
                onClearFilters={limparFiltros}
              />
            }
          />
          {/*
            ⚠️ O rodapé some enquanto carrega e quando deu erro: anunciar
            "Mostrando 1–25 de 128" sobre um skeleton é informação sobre o
            estado anterior.
          */}
          {state === "idle" ? (
            <DashListFooter
              pagina={paginaAtual}
              pageSize={pageSize}
              total={linhas.length}
              onPageChange={setPagina}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default DashListTemplate;
