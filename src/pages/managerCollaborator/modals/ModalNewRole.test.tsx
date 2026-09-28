import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const svc = vi.hoisted(() => ({
  createRole: vi.fn(),
  getBaseRoles: vi.fn(),
  getPermissionsHierarchy: vi.fn(),
}));
vi.mock("@/services/prepCourse/createRole", () => ({
  createRole: svc.createRole,
}));
vi.mock("@/services/prepCourse/getBaseRole", () => ({
  getBaseRoles: svc.getBaseRoles,
}));
vi.mock("@/services/roles/getPermissionsHierarchy", () => ({
  getPermissionsHierarchy: svc.getPermissionsHierarchy,
}));
vi.mock("../../../store/auth", () => ({
  useAuthStore: () => ({ data: { token: "tok" } }),
}));
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("../../../components/templates/modalTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

import ModalNewRole from "./ModalNewRole";

// O grupo como a api manda (tickets/023, card 01).
const HIERARQUIA = [
  {
    key: "questoes_cursinho",
    label: "Banco de questões (Cursinho)",
    permissions: [
      {
        key: "editar_questoes_cursinho",
        label: "Editar questões e montar as provas do cursinho",
        type: "prepCourse",
        implies: ["visualizar_questoes_cursinho"],
      },
      {
        key: "visualizar_questoes_cursinho",
        label: "Ver o banco de questões (cursinho)",
        type: "prepCourse",
      },
    ],
  },
];

describe("ModalNewRole do cursinho — banco de questões (023 · 11)", () => {
  beforeEach(() => {
    svc.getBaseRoles.mockResolvedValue([]);
    svc.getPermissionsHierarchy.mockResolvedValue(HIERARQUIA);
    svc.createRole.mockReset().mockResolvedValue({ id: "r1", name: "prof" });
  });

  it("marcar 'editar' liga 'ver' junto e salva a permissão", async () => {
    render(
      <ModalNewRole isOpen handleClose={vi.fn()} handleNewRole={vi.fn()} />,
    );
    const editar = await screen.findByRole("switch", {
      name: /Editar questões e montar/,
    });
    const ver = screen.getByRole("switch", { name: /Ver o banco de questões/ });
    expect(editar).toHaveAttribute("aria-checked", "false");

    fireEvent.click(editar);

    expect(editar).toHaveAttribute("aria-checked", "true");
    expect(ver).toHaveAttribute("aria-checked", "true"); // implies

    fireEvent.change(screen.getByPlaceholderText("Ex: coordenador"), {
      target: { value: "prof" },
    });
    fireEvent.click(screen.getByText("Salvar"));

    await waitFor(() => expect(svc.createRole).toHaveBeenCalledTimes(1));
    expect(svc.createRole.mock.calls[0][0]).toMatchObject({
      name: "prof",
      editarQuestoesCursinho: true,
    });
  });

  it("sem mexer, as duas vão desligadas", async () => {
    render(
      <ModalNewRole isOpen handleClose={vi.fn()} handleNewRole={vi.fn()} />,
    );
    await screen.findByRole("switch", { name: /Editar questões/ });
    fireEvent.change(screen.getByPlaceholderText("Ex: coordenador"), {
      target: { value: "x" },
    });
    fireEvent.click(screen.getByText("Salvar"));
    await waitFor(() => expect(svc.createRole).toHaveBeenCalled());
    expect(svc.createRole.mock.calls[0][0]).toMatchObject({
      editarQuestoesCursinho: false,
      visualizarQuestoesCursinho: false,
    });
  });
});
