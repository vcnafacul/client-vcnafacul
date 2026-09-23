import { Roles } from "@/enums/roles/roles";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PartnerClassWithStudents } from "./index";

/* -------------------------------------------------------------------------- *
 * ⚠️ O que está sob teste aqui é **a aba nova**: se ela existe, para quem, e
 * quando o serviço do `04b` é chamado. O resto da tela (grid de alunos, PDF,
 * modais, analytics) é dublado com o mínimo que a faz renderizar — testá-lo
 * aqui só encareceria o arquivo sem provar nada sobre a aba.
 * -------------------------------------------------------------------------- */

const estado = vi.hoisted(() => ({
  permissao: {} as Record<string, boolean>,
}));

vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({
    data: { token: "tok", permissao: estado.permissao },
  }),
}));

const getClassById = vi.hoisted(() =>
  vi.fn(async () => ({
    id: "t-1",
    name: "Turma A",
    students: [],
    totalAttendanceRecords: 0,
  })),
);
vi.mock("@/services/prepCourse/class/getClassById", () => ({ getClassById }));

const getCancelledStudentsByClassId = vi.hoisted(() => vi.fn(async () => []));
vi.mock("@/services/prepCourse/class/getCancelledStudentsByClassId", () => ({
  getCancelledStudentsByClassId,
}));

const getPartnerLogo = vi.hoisted(() => vi.fn(async () => new Blob()));
vi.mock("@/services/prepCourse/prepCourse/getPartnerLogo", () => ({
  getPartnerLogo,
}));

/**
 * ⚠️ O hook real embrulha tudo em toast do `react-toastify`; aqui só interessa
 * que o `onSuccess` corra, senão a tela nunca sai do estado vazio.
 */
vi.mock("@/hooks/useToastAsync", () => ({
  useToastAsync:
    () =>
    async ({
      action,
      onSuccess,
    }: {
      action: () => Promise<unknown>;
      onSuccess?: (r: unknown) => void;
    }) => {
      try {
        const res = await action();
        onSuccess?.(res);
      } catch {
        /* a tela de turma não é o que está sob teste */
      }
    },
}));

// As duas abas antigas: dublês mudos, para não arrastar rede nem Recharts.
vi.mock("@/components/organisms/classSimuladoAnalytics", () => ({
  ClassSimuladoAnalytics: () => <div>analytics simulado</div>,
}));
vi.mock("@/components/organisms/classEssayAnalytics", () => ({
  ClassEssayAnalytics: () => <div>analytics redacao</div>,
}));
vi.mock("@/components/organisms/classSimuladoAnalytics/MonthPicker", () => ({
  MonthPicker: () => null,
}));

vi.mock("@mui/x-data-grid", () => ({
  DataGrid: () => <div data-testid="data-grid" />,
}));

vi.mock("heic2any", () => ({ default: vi.fn() }));

/**
 * ⚠️ O serviço do `04b` fica **de verdade por trás da `SimuladosDaTurma`** —
 * só ele é dublado. É isso que faz o teste de "não chamou" falar sobre a tela,
 * e não sobre um dublê de componente que nunca buscaria nada.
 */
const buscarSimuladosComCartao = vi.hoisted(() =>
  vi.fn(async () => ({ simulados: [] })),
);
vi.mock("@/services/relatorioSimulado/buscarSimuladosComCartao", () => ({
  buscarSimuladosComCartao,
}));

const montar = ({
  permissao,
  // ⚠️ A aba entrou na URL no card 17 — ver `abaDaTurma.ts`.
  rota = "/dashboard/turmas/t-1",
}: {
  permissao: Record<string, boolean>;
  rota?: string;
}) => {
  estado.permissao = permissao;
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <Routes>
        <Route
          path="/dashboard/turmas/:hashClassId"
          element={<PartnerClassWithStudents />}
        />
      </Routes>
    </MemoryRouter>,
  );
};

/**
 * ⚠️ `mouseDown`, e não `click`: o `TabsTrigger` do Radix troca de aba no
 * `onMouseDown`. Um `click` aqui passaria sem a aba ter trocado.
 */
const abrirAba = (nome: RegExp) =>
  fireEvent.mouseDown(screen.getByRole("tab", { name: nome }));

const COM_A_ABA = {
  [Roles.visualizarTurmas]: true,
  [Roles.gerenciarEstudantes]: true,
};

describe("PartnerClassWithStudents — aba de simulados por cartão", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buscarSimuladosComCartao.mockResolvedValue({ simulados: [] });
  });

  it("⚠️ sem gerenciarEstudantes a aba NÃO existe", async () => {
    // e o 04b não pode nem ser chamado: devolveria 403
    montar({ permissao: { [Roles.visualizarTurmas]: true } });

    expect(await screen.findByRole("tab", { name: /alunos/i })).toBeInTheDocument();
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

    await waitFor(() =>
      expect(buscarSimuladosComCartao).toHaveBeenCalledWith("tok", "t-1"),
    );
  });

  it("⚠️ reabrir a aba busca de novo — e isso é de propósito", async () => {
    // O Radix desmonta o TabsContent inativo, então o componente perde estado
    // e rebusca. Quem está subindo cartões quer os números novos ao voltar.
    // O critério de aceite original dizia o contrário e estava errado.
    montar({ permissao: COM_A_ABA });
    await screen.findByRole("tab", { name: /simulado/i });

    abrirAba(/simulado/i);
    await waitFor(() =>
      expect(buscarSimuladosComCartao).toHaveBeenCalledTimes(1),
    );

    abrirAba(/alunos/i);
    abrirAba(/simulado/i);

    await waitFor(() =>
      expect(buscarSimuladosComCartao).toHaveBeenCalledTimes(2),
    );
  });
});

describe("PartnerClassWithStudents — a aba vem da URL (card 17)", () => {
  it("⚠️ `?aba=desempenho` abre direto na aba de evolução", async () => {
    /*
      É o que torna o link do relatório possível: antes a aba era estado local,
      e as duas metades da mesma pergunta não tinham como mandar a pessoa uma
      para a outra.
    */
    montar({ permissao: COM_A_ABA, rota: "/dashboard/turmas/t-1?aba=desempenho" });

    expect(
      await screen.findByRole("tab", { name: "Desempenho", selected: true }),
    ).toBeInTheDocument();
  });

  it("sem o parâmetro, abre em Alunos", async () => {
    montar({ permissao: COM_A_ABA });

    expect(
      await screen.findByRole("tab", { name: "Alunos", selected: true }),
    ).toBeInTheDocument();
  });

  it("⚠️ aba desconhecida cai em Alunos, e não numa tela em branco", async () => {
    // O Radix aceita qualquer string em `value` e renderiza vazio quando nenhum
    // `TabsContent` casa.
    montar({ permissao: COM_A_ABA, rota: "/dashboard/turmas/t-1?aba=notas" });

    expect(
      await screen.findByRole("tab", { name: "Alunos", selected: true }),
    ).toBeInTheDocument();
  });
});
