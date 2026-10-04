import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/** Permissões do usuário logado, trocadas por teste. */
const auth = vi.hoisted(() => ({ permissao: {} as Record<string, boolean> }));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({
    data: { token: "tok", permissao: auth.permissao },
  }),
}));
vi.mock("react-toastify", () => ({
  toast: { error: vi.fn(), warn: vi.fn(), success: vi.fn(), loading: vi.fn() },
}));
vi.mock("@/components/templates/modalTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
// O DataGrid não roda no jsdom (ver `index.test.tsx`): o dublê expõe o que
// importa aqui — se a tabela tem caixas de seleção.
vi.mock("@mui/x-data-grid", () => ({
  DataGrid: (p: { checkboxSelection?: boolean }) => (
    <div data-testid="data-grid" data-caixas={String(!!p.checkboxSelection)} />
  ),
}));
vi.mock(
  "@/services/prepCourse/attendanceRecord/getAttendanceRecordByStudentId",
  () => ({
    getAttendanceRecordByStudentId: vi.fn().mockResolvedValue({
      data: [
        {
          id: "r1",
          registeredAt: "2026-03-10T00:00:00Z",
          period: "MANHA",
          studentAttendance: [{ present: false }],
          class: { name: "Turma A" },
        },
      ],
      totalItems: 1,
    }),
  }),
);
vi.mock(
  "@/services/prepCourse/periodJustification/getPeriodJustifications",
  () => ({
    getPeriodJustifications: vi.fn().mockResolvedValue({
      data: [
        {
          id: "pj1",
          startDate: "2026-03-01",
          endDate: "2026-03-05",
          justification: "Atestado",
          faltasJustificadas: 2,
          createdBy: { name: "Ana" },
          createdAt: "2026-03-06",
        },
      ],
      totalItems: 1,
    }),
  }),
);

import { AttendanceRecordByStudentModal } from "./attendanceRecordByStudentModal";

const abrir = () =>
  render(
    <AttendanceRecordByStudentModal isOpen handleClose={vi.fn()} studentId="s1" />,
  );
const abrirJustificativas = async () => {
  fireEvent.click(await screen.findByText(/Justificativas de Período/));
  await screen.findByText("Atestado");
};

describe("janela Registro de Presença do aluno (tickets-documentacao, 07)", () => {
  beforeEach(() => {
    auth.permissao = {};
  });

  it("com Gerenciar Turmas: botões, caixas de seleção e excluir período", async () => {
    auth.permissao = { gerenciarTurmas: true };
    abrir();
    expect(screen.getByText("Aplicar Justificativa")).toBeInTheDocument();
    expect(screen.getByText("Justificar Período")).toBeInTheDocument();
    expect(screen.getByTestId("data-grid")).toHaveAttribute("data-caixas", "true");
    await abrirJustificativas();
    expect(screen.getByTitle("Excluir justificativa")).toBeInTheDocument();
  });

  it("⚠️ só Visualizar Turmas: só leitura — sem botões, caixas nem excluir", async () => {
    auth.permissao = { visualizarTurmas: true };
    abrir();
    expect(screen.queryByText("Aplicar Justificativa")).toBeNull();
    expect(screen.queryByText("Justificar Período")).toBeNull();
    expect(screen.getByTestId("data-grid")).toHaveAttribute("data-caixas", "false");
    await abrirJustificativas();
    expect(screen.queryByTitle("Excluir justificativa")).toBeNull();
  });
});

describe("carteirinha sem permissão de ver a foto", () => {
  it("mostra o aviso no lugar da foto padrão", async () => {
    const { default: PhotoStudentCard } = await import(
      "@/components/atoms/photoStudentCard"
    );
    render(
      <PhotoStudentCard
        photo={null}
        aviso="Foto disponível só para quem visualiza estudantes"
      />,
    );
    expect(
      screen.getByText("Foto disponível só para quem visualiza estudantes"),
    ).toBeInTheDocument();
    expect(screen.queryByAltText("Foto de perfil")).toBeNull();
  });

  it("sem aviso, segue mostrando a foto", async () => {
    const { default: PhotoStudentCard } = await import(
      "@/components/atoms/photoStudentCard"
    );
    render(<PhotoStudentCard photo="blob:foto" />);
    await waitFor(() =>
      expect(screen.getByAltText("Foto de perfil")).toHaveAttribute(
        "src",
        "blob:foto",
      ),
    );
  });
});
