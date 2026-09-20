# A entrada pela turma — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Uma terceira aba na tela de turma que lista os simulados que aquela turma respondeu por cartão, e leva ao relatório do card `06` com a turma aplicada.

**Architecture:** O relatório inteiro já existe e já aceita `?turma=`. Este card acrescenta só a entrada: estende o serviço do `04b` com um `turmaId` opcional, monta uma lista com o `DashTable` que o `06` trouxe, e liga uma aba nova no mecanismo que a tela já tem.

**Tech Stack:** React 19, Vite, TypeScript, React Router v7, Tailwind, Radix, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-09-20-entrada-pela-turma-design.md`

**Branch:** `feature/05-entrada-pela-turma`, que **sai de `feature/06-relatorio-do-simulado`** (PR #689). Nada da pilha está mergeado.

---

## Estrutura de arquivos

| arquivo | responsabilidade |
|---|---|
| `src/services/relatorioSimulado/buscarSimuladosComCartao.ts` | +`turmaId` opcional |
| `src/pages/partnerClassWithStudents/SimuladosDaTurma.tsx` | **novo** — a aba: lista, estados, navegação |
| `src/pages/partnerClassWithStudents/index.tsx` | +a aba, atrás da permissão, com busca preguiçosa |

---

## ⚠️ Regras da casa

- Testes: `npx vitest run <caminho>`. Build: `npm run build`.
- ⚠️ **`npm run lint` está quebrado no repo.** Use `ESLINT_USE_FLAT_CONFIG=false npx eslint <caminhos>`.
- ⚠️ **`@testing-library/user-event` NÃO está instalado.** Use `fireEvent`.
- ⚠️ **`fireEvent.click` não troca aba do Radix** — o `TabsTrigger` reage a **`onMouseDown`**. Um `click` deixa a aba parada e faz um teste de "não buscou" passar sem provar nada. Há um helper `abrirAba()` em `src/pages/relatorioSimulado/index.test.tsx` — leia antes de escrever o seu.
- ⚠️ **Radix é caro no jsdom neste projeto** (~51s para 22 testes num arquivo, custo vaza entre testes). Poucas montagens, cada uma verificando bastante.
- ⚠️ **`DashTableVazio` não tem prop nenhuma.** Para texto próprio, passe um nó local no `emptyState`, como `TabelaDeQuestoes.tsx` faz.
- ⚠️ **O `DashTable` só emite `title` quando a célula devolve string ou número.** Célula que devolve elemento trunca sem tooltip.
- Commitar **adicionando por nome**. Deixe o `docs/TICKET-playwright-mcp-spike.md` sem rastrear em paz.

---

## Task 1: O serviço aceita turma

A api já expõe `/mssimulado/relatorio/simulado/simulados/turma/:turmaId` (construída no `04b`) e ninguém a consome. O client só bate em `/simulados`.

**Files:**
- Modify: `src/services/relatorioSimulado/buscarSimuladosComCartao.ts`
- Test: `src/services/relatorioSimulado/buscarRelatorio.test.ts` (o arquivo já cobre os três serviços)

- [ ] **Step 1: Escrever os testes que falham**

Acrescente ao `describe` existente:

```ts
  it("buscarSimuladosComCartao com turma usa o segmento de turma", async () => {
    await buscarSimuladosComCartao("tok", "t-1");

    expect(fetchWrapper.mock.calls[0][0]).toContain(
      "/mssimulado/relatorio/simulado/simulados/turma/t-1",
    );
  });

  it("⚠️ turma vazia é tratada como SEM turma", async () => {
    // mesma armadilha do `?turma=` na rota do relatório: string vazia não pode
    // virar `/simulados/turma/`, que é uma rota que não existe
    await buscarSimuladosComCartao("tok", "");

    const url = fetchWrapper.mock.calls[0][0] as string;
    expect(url).toMatch(/\/simulados$/);
  });
```

O teste existente `buscarSimuladosComCartao não leva simuladoId nenhum` continua valendo e não muda.

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/services/relatorioSimulado/`
Expected: FAIL — o segundo argumento é ignorado, então a URL não tem o segmento de turma.

- [ ] **Step 3: Implementar**

```ts
/**
 * Quais simulados do cursinho — ou de uma turma dele — têm cartão enviado.
 * O card `04b`.
 *
 * ⚠️ Exige `gerenciarEstudantes` e um colaborador com cursinho: chamar sem isso
 * devolve 403. Ver os gates em `simuladosView` e na aba da tela de turma.
 *
 * ⚠️ `turmaId` é **segmento de caminho**, nunca query — a api expõe as duas
 * como rotas distintas. E o `cursinhoId` não viaja: sai do JWT do outro lado.
 */
export async function buscarSimuladosComCartao(
  token: string,
  turmaId?: string,
): Promise<SimuladosComCartao> {
  // ⚠️ `||`, não `??`: string vazia tem que cair no recorte do cursinho, senão
  // a URL vira `/simulados/turma/`, que não é rota nenhuma. Mesma armadilha do
  // `?turma=` vazio na rota do relatório.
  const caminho = turmaId
    ? `${relatorioSimulado}/simulados/turma/${turmaId}`
    : `${relatorioSimulado}/simulados`;

  const response = await fetchWrapper(caminho, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (response.status !== 200) {
    throw new Error("Erro ao buscar os simulados com cartão");
  }
  return await response.json();
}
```

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run src/services/relatorioSimulado/ src/pages/dashProvas/modals/`
Expected: PASS — inclusive os testes do `simuladosView`, que chamam o serviço com um argumento só.

- [ ] **Step 5: Commit**

```bash
git add src/services/relatorioSimulado/buscarSimuladosComCartao.ts src/services/relatorioSimulado/buscarRelatorio.test.ts
git commit -m "feat: o servico dos simulados com cartao aceita turma"
```

---

## Task 2: A aba

**Files:**
- Create: `src/pages/partnerClassWithStudents/SimuladosDaTurma.tsx`
- Test: `src/pages/partnerClassWithStudents/SimuladosDaTurma.test.tsx`

- [ ] **Step 1: Escrever os testes que falham**

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import { fireEvent } from "@testing-library/dom";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SimuladosDaTurma } from "./SimuladosDaTurma";

const buscarSimuladosComCartao = vi.hoisted(() => vi.fn());
vi.mock("@/services/relatorioSimulado/buscarSimuladosComCartao", () => ({
  buscarSimuladosComCartao,
}));

const navigate = vi.hoisted(() => vi.fn());
vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => navigate,
}));

const simulado = (over = {}) => ({
  simuladoId: "sim-1",
  nome: "ENEM 2024 — 1º dia",
  cartoes: 12,
  comLeituraConcluida: 9,
  ultimoEnvio: "2026-05-02T00:00:00.000Z",
  ...over,
});

const montar = () =>
  render(
    <MemoryRouter>
      <SimuladosDaTurma token="tok" turmaId="t-1" />
    </MemoryRouter>,
  );

describe("SimuladosDaTurma", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buscarSimuladosComCartao.mockResolvedValue({ simulados: [simulado()] });
  });

  it("busca os simulados DA TURMA, não do cursinho", async () => {
    montar();

    await waitFor(() =>
      expect(buscarSimuladosComCartao).toHaveBeenCalledWith("tok", "t-1"),
    );
  });

  it("mostra nome, cartões e quantos entraram no cálculo", async () => {
    montar();

    expect(await screen.findByText("ENEM 2024 — 1º dia")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("9")).toBeInTheDocument();
  });

  it("⚠️ diz que o recorte é só cartão-resposta", async () => {
    // é aqui que a pessoa decide entrar; sem isto a primeira pergunta da
    // semana é "cadê o fulano que respondeu no computador?"
    montar();

    expect(await screen.findByText(/cart[ãa]o-resposta/i)).toBeInTheDocument();
  });

  it("clicar na linha leva ao relatório COM a turma aplicada", async () => {
    montar();
    fireEvent.click(await screen.findByText("ENEM 2024 — 1º dia"));

    expect(navigate).toHaveBeenCalledWith(
      expect.stringContaining("relatorio-simulado/sim-1?turma=t-1"),
    );
  });

  it("⚠️ simulado sem nome continua na lista e continua clicável", async () => {
    // o 04b devolve nome nulo quando o documento do Simulado sumiu. Os cartões
    // existem — escondê-los é o oposto do que este relatório serve para fazer,
    // e o relatório dele abre, porque as respostas vivem no histórico.
    buscarSimuladosComCartao.mockResolvedValue({
      simulados: [simulado({ nome: null, simuladoId: "sim-morto" })],
    });
    montar();

    const rotulo = await screen.findByText(/removido/i);
    fireEvent.click(rotulo);

    expect(navigate).toHaveBeenCalledWith(
      expect.stringContaining("relatorio-simulado/sim-morto?turma=t-1"),
    );
  });

  it("turma sem cartão mostra estado vazio explicativo", async () => {
    buscarSimuladosComCartao.mockResolvedValue({ simulados: [] });
    montar();

    expect(await screen.findByText(/nenhum simulado/i)).toBeInTheDocument();
  });

  it("erro é recuperável, não tela em branco", async () => {
    buscarSimuladosComCartao.mockRejectedValueOnce(new Error("caiu"));
    montar();

    const tentar = await screen.findByRole("button", { name: /tentar/i });
    buscarSimuladosComCartao.mockResolvedValue({ simulados: [simulado()] });
    fireEvent.click(tentar);

    expect(await screen.findByText("ENEM 2024 — 1º dia")).toBeInTheDocument();
  });
});
```

⚠️ **Confira o rótulo real do botão de retry do `DashTableErro`** antes (`src/components/dashV2/DashTableEmpty.tsx`) e ajuste a regex ao que ele renderiza. Não invente.

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/pages/partnerClassWithStudents/SimuladosDaTurma.test.tsx`
Expected: FAIL — módulo não existe.

- [ ] **Step 3: Implementar**

`src/pages/partnerClassWithStudents/SimuladosDaTurma.tsx`:

```tsx
import {
  DashTable,
  DashTableVazio,
  dashV2,
  sortRows,
  type DashColumn,
  type SortState,
} from "@/components/dashV2";
import type { SimuladoComCartao } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";
import { DASH, RELATORIO_SIMULADO } from "@/routes/path";
import { buscarSimuladosComCartao } from "@/services/relatorioSimulado/buscarSimuladosComCartao";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const VAZIO = "—";
export const SEM_NOME = "Simulado removido";
export const TEXTO_VAZIO = "Nenhum simulado desta turma teve cartão enviado";

function dataCurta(iso: string | null): string {
  if (!iso) return VAZIO;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? VAZIO : d.toLocaleDateString("pt-BR");
}

const colunas: DashColumn<SimuladoComCartao>[] = [
  {
    id: "nome",
    header: "Simulado",
    primary: true,
    /**
     * ⚠️ `nome` nulo NÃO some da lista: o `04b` devolve nulo quando o documento
     * do `Simulado` sumiu, e os cartões continuam existindo. Esconder seria o
     * oposto do que este relatório serve para fazer — e o relatório dele abre,
     * porque as respostas vivem no `Historico`, não no simulado.
     */
    cell: (s) => s.nome ?? SEM_NOME,
    sortValue: (s) => s.nome ?? SEM_NOME,
  },
  {
    id: "cartoes",
    header: "Cartões",
    width: "7rem",
    align: "right",
    // ⚠️ PESSOAS, não fotos: a unicidade da junção é {simulado, cursinho, usuario}
    cell: (s) => s.cartoes,
    sortValue: (s) => s.cartoes,
  },
  {
    id: "lidos",
    // ⚠️ Mesmo rótulo que o relatório adotou: a api conta com status completed
    // E nota numérica, então "com leitura concluída" prometeria outra coisa.
    header: "No cálculo da média",
    width: "11rem",
    align: "right",
    hideBelow: "sm",
    cell: (s) => s.comLeituraConcluida,
    sortValue: (s) => s.comLeituraConcluida,
  },
  {
    id: "ultimoEnvio",
    header: "Último envio",
    width: "9rem",
    align: "right",
    hideBelow: "md",
    /**
     * ⚠️ **Não é "última atividade".** É quando o estudante mais recente entrou
     * no recorte: o `registrar` do ms é upsert, então reenvio do mesmo
     * estudante não move a data. O rótulo não pode prometer mais que isso.
     */
    cell: (s) => dataCurta(s.ultimoEnvio),
    sortValue: (s) => (s.ultimoEnvio ? new Date(s.ultimoEnvio) : null),
  },
];

type Estado = "idle" | "loading" | "error";

export function SimuladosDaTurma({
  token,
  turmaId,
}: {
  token: string;
  turmaId: string;
}) {
  const navigate = useNavigate();
  const [simulados, setSimulados] = useState<SimuladoComCartao[]>([]);
  const [estado, setEstado] = useState<Estado>("loading");
  const [sort, setSort] = useState<SortState | undefined>({
    columnId: "ultimoEnvio",
    direction: "desc",
  });

  const carregar = () => {
    setEstado("loading");
    buscarSimuladosComCartao(token, turmaId)
      .then((r) => {
        setSimulados(r.simulados);
        setEstado("idle");
      })
      .catch(() => setEstado("error"));
  };

  useEffect(carregar, [token, turmaId]);

  const linhas = useMemo(
    () => sortRows(simulados, colunas, sort),
    [simulados, sort],
  );

  return (
    <div className="flex flex-col gap-3 p-4">
      {/*
        ⚠️ Escrito aqui, e não só dentro do relatório: é nesta lista que a
        pessoa decide entrar.
      */}
      <p className={cn("text-xs", dashV2.text.muted)}>
        Só aparecem simulados respondidos por cartão-resposta. Quem resolveu
        pela plataforma não entra nesta lista nem nos relatórios dela.
      </p>

      <DashTable<SimuladoComCartao>
        rows={linhas}
        columns={colunas}
        rowKey={(s) => s.simuladoId}
        onRowClick={(s) =>
          navigate(
            `${DASH}/${RELATORIO_SIMULADO}/${s.simuladoId}?turma=${turmaId}`,
          )
        }
        sort={sort}
        onSortChange={setSort}
        state={estado}
        onRetry={carregar}
        stickyHeader
        emptyState={
          // ⚠️ Texto próprio DENTRO do emptyState, e nada fora. O
          // `DashTableVazio` não aceita prop, e a revisão do card 06 pegou
          // exatamente o erro de ter duas superfícies de estado na mesma tela
          // — duas mensagens e dois botões. Mesma forma do `TabelaDeQuestoes`.
          <div className="py-8 text-center">
            <p className={cn("text-sm", dashV2.text.secondary)}>{TEXTO_VAZIO}</p>
          </div>
        }
      />
    </div>
  );
}

export default SimuladosDaTurma;
```

⚠️ **Leia o `TabelaDeQuestoes.tsx` e veja como ele monta o `emptyState`** — siga a mesma forma. O `DashTableVazio` genérico **não** é usado aqui: ele fala em limpar filtros, e esta lista não tem filtro nenhum. E o import dele sai, se ficar sem uso.

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run src/pages/partnerClassWithStudents/`
Expected: PASS

- [ ] **Step 5: Provar que dois testes discriminam**

**(a)** Troque `buscarSimuladosComCartao(token, turmaId)` por `buscarSimuladosComCartao(token)`. O teste `busca os simulados DA TURMA` tem que falhar.
**(b)** Troque `s.nome ?? SEM_NOME` por `s.nome`. O teste de simulado sem nome tem que falhar.

Reverta os dois e confirme verde. Reporte o que viu.

- [ ] **Step 6: Commit**

```bash
git add src/pages/partnerClassWithStudents/SimuladosDaTurma.tsx src/pages/partnerClassWithStudents/SimuladosDaTurma.test.tsx
git commit -m "feat: lista dos simulados com cartao da turma"
```

---

## Task 3: Ligar a aba na tela

⚠️ **A aba não aparece sem `gerenciarEstudantes`**, e nesse caso o `04b` não é chamado — ele devolveria 403.

⚠️ **E busca só quando a aba abre.** A tela já faz duas chamadas no mount; uma terceira servindo uma aba que a maioria não abre é custo por nada.

**Files:**
- Modify: `src/pages/partnerClassWithStudents/index.tsx`
- Test: `src/pages/partnerClassWithStudents/index.test.tsx` (crie se não existir, seguindo o padrão de mocks de `src/pages/partnerPrepProvas/index.test.tsx`)

- [ ] **Step 1: Escrever os testes que falham**

```tsx
  it("⚠️ sem gerenciarEstudantes a aba NÃO existe", async () => {
    // e o 04b não pode nem ser chamado: devolveria 403
    montar({ permissao: { [Roles.visualizarTurmas]: true } });

    expect(
      screen.queryByRole("tab", { name: /simulado/i }),
    ).not.toBeInTheDocument();
    expect(buscarSimuladosComCartao).not.toHaveBeenCalled();
  });

  it("com gerenciarEstudantes a aba aparece", async () => {
    montar({
      permissao: {
        [Roles.visualizarTurmas]: true,
        [Roles.gerenciarEstudantes]: true,
      },
    });

    expect(
      await screen.findByRole("tab", { name: /simulado/i }),
    ).toBeInTheDocument();
  });

  it("⚠️ só busca quando a aba abre, não no mount", async () => {
    montar({
      permissao: {
        [Roles.visualizarTurmas]: true,
        [Roles.gerenciarEstudantes]: true,
      },
    });
    await screen.findByRole("tab", { name: /simulado/i });

    expect(buscarSimuladosComCartao).not.toHaveBeenCalled();

    // ⚠️ mouseDown: o TabsTrigger do Radix não reage a click, e um click aqui
    // faria este teste passar sem a aba ter trocado
    fireEvent.mouseDown(screen.getByRole("tab", { name: /simulado/i }));

    await waitFor(() => expect(buscarSimuladosComCartao).toHaveBeenCalled());
  });
```

⚠️ **O `montar()` da tela precisa de bastante dublê** — ela chama `getClassById`, `getCancelledStudentsByClassId`, `getPartnerLogo` e os serviços de analytics, e usa `useAuthStore`. Monte o mínimo que faz a tela renderizar, e **não** teste o resto da tela: o que está sob teste aqui é a aba nova.

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx vitest run src/pages/partnerClassWithStudents/index.test.tsx`
Expected: FAIL — a aba não existe.

- [ ] **Step 3: Implementar**

Importe no topo:

```tsx
import { SimuladosDaTurma } from "./SimuladosDaTurma";
```

`permissao` e `token` já saem do `useAuthStore` na linha ~129. Acrescente, perto do `activeTab`:

```tsx
  // ⚠️ A aba some sem a permissão, e com ela some a chamada do `04b`, que
  // devolveria 403. Diferente do ícone do card 06, que fica desabilitado com
  // motivo: aba é navegação, fica no topo o tempo todo, e o `TabsTrigger`
  // desabilitado do shadcn não recebe foco nem hover para dizer por quê.
  const podeVerRelatorio = !!permissao[Roles.gerenciarEstudantes];
```

No `TabsList` (linha ~450):

```tsx
          <TabsList>
            <TabsTrigger value="alunos">Alunos</TabsTrigger>
            <TabsTrigger value="desempenho">Desempenho</TabsTrigger>
            {podeVerRelatorio && (
              <TabsTrigger value="simulados">Simulados por cartão</TabsTrigger>
            )}
          </TabsList>
```

E o conteúdo, junto dos outros `TabsContent`:

```tsx
        {/*
          ⚠️ Renderizado só quando a aba está ativa — é isso que faz a busca
          ser preguiçosa, sem precisar de estado de controle. A tela já faz
          duas chamadas no mount; uma terceira servindo uma aba que a maioria
          não abre é custo por nada.
        */}
        {podeVerRelatorio && (
          <TabsContent value="simulados">
            {activeTab === "simulados" && hashClassId && (
              <SimuladosDaTurma token={token} turmaId={hashClassId} />
            )}
          </TabsContent>
        )}
```

⚠️ **`hashClassId` é o id cru da turma**, não um hash — a listagem navega com `classItem.id`. Serve direto, sem esperar o fetch da turma.

- [ ] **Step 4: Rodar e confirmar que passa**

Run: `npx vitest run src/pages/partnerClassWithStudents/`
Expected: PASS

- [ ] **Step 5: Provar que o teste discrimina**

Troque `{podeVerRelatorio && (` por `{true && (` nas duas ocorrências. O teste `sem gerenciarEstudantes a aba NÃO existe` tem que falhar. Reverta e confirme verde.

- [ ] **Step 6: Suíte, build e commit**

```bash
npx vitest run
npm run build
ESLINT_USE_FLAT_CONFIG=false npx eslint src/pages/partnerClassWithStudents src/services/relatorioSimulado
git add src/pages/partnerClassWithStudents/index.tsx src/pages/partnerClassWithStudents/index.test.tsx
git commit -m "feat: aba de simulados por cartao na tela de turma"
```

---

## Task 4: O "voltar" precisa saber voltar para a turma

⚠️ **Sem isto o card entrega um caminho de ida sem volta correta.** O `voltar()` do relatório
(`src/pages/relatorioSimulado/index.tsx`) faz:

```tsx
    if (de) { navigate(de.caminho, { replace: true, state: { de } }); return; }
    navigate(`${DASH}/${PARTNER_PROVAS}`);
```

Chegando pela turma **não há `de`**, então a pessoa cai na **listagem de provas** — uma tela que ela
não visitou, noutro canto do sistema. O fallback foi escrito quando a única entrada era o modal de
provas; agora há duas entradas e ele mente para uma delas.

O `EstadoDeVolta` hoje exige `filtros`, `provaId` e `pagina`, que são coisas da listagem de provas e
não existem na tela de turma.

**Files:**
- Modify: `src/pages/relatorioSimulado/voltar.ts`
- Modify: `src/pages/partnerClassWithStudents/SimuladosDaTurma.tsx`
- Test: `src/pages/relatorioSimulado/index.test.tsx` e `SimuladosDaTurma.test.tsx`

- [ ] **Step 1: Escrever os testes que falham**

Em `SimuladosDaTurma.test.tsx`:

```tsx
  it("⚠️ leva o caminho de volta no state, senão o relatório devolve à listagem de provas", async () => {
    montar();
    fireEvent.click(await screen.findByText("ENEM 2024 — 1º dia"));

    expect(navigate).toHaveBeenCalledWith(
      expect.stringContaining("relatorio-simulado/sim-1?turma=t-1"),
      { state: { de: { caminho: `/dashboard/turmas/t-1` } } },
    );
  });
```

Em `index.test.tsx` do relatório:

```tsx
  it("voltar usa o caminho do state mesmo sem filtros — veio da tela de turma", () => {
    // o EstadoDeVolta completo é da listagem de provas; quem vem da turma manda
    // só o caminho, e o voltar tem que honrá-lo em vez de cair no fallback
    montarComState({ de: { caminho: "/dashboard/turmas/t-1" } });

    fireEvent.click(screen.getByRole("button", { name: /voltar/i }));

    expect(navigate).toHaveBeenCalledWith("/dashboard/turmas/t-1", {
      replace: true,
      state: { de: { caminho: "/dashboard/turmas/t-1" } },
    });
  });
```

⚠️ **Adapte ao helper que o `index.test.tsx` já tem** para injetar `location.state` — ele existe
desde o card `06`. Não reescreva o dele.

- [ ] **Step 2: Rodar e confirmar que falham**

Run: `npx vitest run src/pages/relatorioSimulado/ src/pages/partnerClassWithStudents/`
Expected: FAIL.

- [ ] **Step 3: Afrouxar o tipo, sem afrouxar o contrato de quem o preenche inteiro**

Em `voltar.ts`:

```ts
export interface EstadoDeVolta {
  /** Para onde voltar. **Só isto é obrigatório.** */
  caminho: string;
  /**
   * O resto é da listagem de provas, e é opcional porque há duas entradas
   * para o relatório.
   *
   * ⚠️ Quem vem da **tela de turma** manda só o `caminho`: não há filtro,
   * prova nem página para restaurar, e exigir campos inventados só para
   * satisfazer o tipo faria a tela mentir sobre o que ela sabe.
   */
  filtros?: {
    nome: string;
    edicao: string;
    aplicacao: string;
    ano: string;
    gabaritoOnly: boolean;
  };
  provaId?: string;
  pagina?: number;
}
```

⚠️ **A `PartnerPrepProvas` continua mandando tudo**, e a restauração de lá continua exigindo os
campos — ela já checa `de.provaId` antes de usar. **Confira** que o `tsc` não passou a aceitar uma
restauração pela metade lá; se passou, ponha a guarda explícita.

Em `SimuladosDaTurma.tsx`, o `onRowClick`:

```tsx
        onRowClick={(s) =>
          navigate(
            `${DASH}/${RELATORIO_SIMULADO}/${s.simuladoId}?turma=${turmaId}`,
            // ⚠️ Sem isto o "voltar" do relatório cai no fallback e manda a
            // pessoa para a LISTAGEM DE PROVAS, que ela não visitou.
            { state: { de: { caminho: `${DASH}/${PARTNER_CLASS}/${turmaId}` } } },
          )
        }
```

Importe `PARTNER_CLASS` de `@/routes/path`.

- [ ] **Step 4: Rodar e confirmar que passam**

Run: `npx vitest run src/pages/relatorioSimulado/ src/pages/partnerClassWithStudents/ src/pages/partnerPrepProvas/`
Expected: PASS — **inclusive os da `partnerPrepProvas`**, cuja restauração completa não pode ter
regredido.

- [ ] **Step 5: Commit**

```bash
git add src/pages/relatorioSimulado/voltar.ts src/pages/relatorioSimulado/index.test.tsx src/pages/partnerClassWithStudents/SimuladosDaTurma.tsx src/pages/partnerClassWithStudents/SimuladosDaTurma.test.tsx
git commit -m "feat: voltar do relatorio devolve a turma quando veio dela"
```

---

## Fechamento

```bash
npx vitest run
npm run build
ESLINT_USE_FLAT_CONFIG=false npx eslint src/pages/partnerClassWithStudents src/pages/relatorioSimulado src/services/relatorioSimulado
```

⚠️ **Gate manual, para o PR** — jsdom não alcança:

1. A aba aparecendo e a lista com mais de uma dezena de simulados, em 1440px
2. Clicar numa linha e conferir que o relatório abre **com a turma aplicada** (a coluna Turma some)
3. O "voltar" do relatório devolvendo à **tela de turma**, e não à listagem de provas
