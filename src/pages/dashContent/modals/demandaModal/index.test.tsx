import { StatusEnum } from "@/enums/generic/statusEnum";
import { Roles } from "@/enums/roles/roles";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ContentDtoInput } from "@/dtos/content/contentDtoInput";
import DemandaModal from ".";

const updateStatus = vi.hoisted(() => vi.fn(async () => true));
vi.mock("@/services/content/updateStatus", () => ({ updateStatus }));
vi.mock("@/services/content/resetDemand", () => ({ resetDemand: vi.fn() }));
const getFile = vi.hoisted(() => vi.fn(async () => new Blob(["PK"])));
vi.mock("@/services/content/getFile", () => ({ getFile }));
vi.mock("@/components/atoms/youtubePlayer", () => ({
  YoutubePlayer: ({ videoId }: { videoId: string }) => (
    <div data-testid="player">{videoId}</div>
  ),
}));
vi.mock("@/services/content/adjustmentProposal", () => ({
  getProposals: vi.fn(async () => []),
  reviewProposal: vi.fn(),
}));
const getTimeline = vi.hoisted(() => vi.fn());
vi.mock("@/services/content/getTimeline", () => ({ getTimeline }));
vi.mock("@/components/atoms/docxPreview", () => ({ default: () => null }));
vi.mock("../AdjustmentProposalModal", () => ({ default: () => null }));
vi.mock("react-toastify", () => ({
  toast: {
    loading: vi.fn(),
    update: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const auth = vi.hoisted(() => ({
  data: { token: "tok", permissao: {} as Record<string, boolean> },
}));
vi.mock("@/store/auth", () => ({ useAuthStore: () => auth }));

const demanda = (over: Partial<ContentDtoInput> = {}): ContentDtoInput =>
  ({
    id: "d1",
    title: "Aula de funções",
    description: "descrição",
    status: StatusEnum.Pending,
    createdAt: "2026-09-01T12:00:00Z",
    userId: "u-criador",
    createdByName: "Carla Mendes",
    file: { id: "f1", originalName: "aula.docx", uploadedBy: "u-autor" },
    uploadedByName: "Ana Souza",
    lastEditedBy: "u-autor",
    lastEditedByName: "Ana Souza",
    lastEditedAt: "2026-09-02T12:00:00Z",
    subject: {
      id: "s1",
      name: "Funções",
      frente: { nome: "Álgebra", materia: "m1" },
    },
    ...over,
  }) as unknown as ContentDtoInput;

const montar = (over: Partial<ContentDtoInput> = {}) => {
  const handleClose = vi.fn();
  const updateStatusDemand = vi.fn();
  render(
    <DemandaModal
      isOpen
      demand={demanda(over)}
      handleClose={handleClose}
      updateStatusDemand={updateStatusDemand}
    />,
  );
  return { handleClose, updateStatusDemand };
};

const abrirRejeitar = () => {
  fireEvent.click(screen.getByRole("button", { name: "Rejeitar" }));
  return {
    confirmar: screen.getByRole("button", { name: "Confirmar" }),
    motivo: screen.getByRole("textbox", { name: "Motivo da rejeição" }),
  };
};

beforeEach(() => {
  updateStatus.mockClear();
  getFile.mockClear();
  getTimeline.mockReset().mockResolvedValue([
    {
      tipo: "criada",
      em: "2026-09-01T12:00:00.000Z",
      porId: "u-criador",
      por: "Carla Mendes",
    },
  ]);
  auth.data.permissao = {
    [Roles.validarDemanda]: true,
    [Roles.uploadDemanda]: true,
  };
});

describe("DemandaModal — rejeição com motivo (048/07)", () => {
  it("rejeitar sem motivo não confirma nem chama o serviço", () => {
    montar();
    const { confirmar, motivo } = abrirRejeitar();

    expect(confirmar).toBeDisabled();
    fireEvent.change(motivo, { target: { value: "   " } });
    expect(confirmar).toBeDisabled();
    fireEvent.click(confirmar);

    expect(updateStatus).not.toHaveBeenCalled();
  });

  it("com motivo, confirma e manda o motivo para o serviço", async () => {
    const { updateStatusDemand } = montar();
    const { confirmar, motivo } = abrirRejeitar();

    fireEvent.change(motivo, { target: { value: "  Faltou a bibliografia " } });
    expect(confirmar).toBeEnabled();
    fireEvent.click(confirmar);

    await waitFor(() =>
      expect(updateStatus).toHaveBeenCalledWith(
        "d1",
        StatusEnum.Rejected,
        "tok",
        "Faltou a bibliografia",
      ),
    );
    await waitFor(() => expect(updateStatusDemand).toHaveBeenCalledWith("d1"));
  });

  it("o texto não promete que a demanda volta para quem enviou", () => {
    montar();
    abrirRejeitar();
    expect(screen.getByText(/fica como rejeitada/)).toBeInTheDocument();
    expect(screen.queryByText(/volta para quem enviou/)).toBeNull();
  });

  it("aprovar não pede motivo e manda sem ele", async () => {
    montar();
    fireEvent.click(screen.getByRole("button", { name: "Aprovar" }));
    await waitFor(() =>
      expect(updateStatus).toHaveBeenCalledWith(
        "d1",
        StatusEnum.Approved,
        "tok",
        undefined,
      ),
    );
  });
});

describe("DemandaModal — motivo e autores na tela", () => {
  it("demanda rejeitada mostra o motivo; pendente não mostra o bloco", () => {
    const { unmount } = render(
      <DemandaModal
        isOpen
        demand={demanda({
          status: StatusEnum.Rejected,
          rejectionReason: "Sem exercícios",
        })}
        handleClose={vi.fn()}
        updateStatusDemand={vi.fn()}
      />,
    );
    expect(screen.getByRole("note")).toHaveTextContent("Motivo da rejeição:");
    expect(screen.getByRole("note")).toHaveTextContent("Sem exercícios");
    unmount();

    montar({ status: StatusEnum.Pending, rejectionReason: undefined });
    expect(screen.queryByRole("note")).toBeNull();
  });

  it("cabeçalho mostra quem criou, de quem é o material e quem aprovou, com iniciais e data", () => {
    montar({
      status: StatusEnum.Approved,
      approvedBy: "u-bruno",
      approvedByName: "Bruno Costa",
      approvedAt: "2026-09-05T12:00:00Z",
    });
    const pessoas = screen.getByRole("list", { name: "Pessoas da demanda" });
    const itens = within(pessoas).getAllByRole("listitem");
    expect(itens.map((li) => li.textContent)).toEqual([
      "CMCriada porCarla Mendes · 01/09/2026",
      "ASMaterial deAna Souza · 02/09/2026",
      "BCAprovada porBruno Costa · 05/09/2026",
    ]);
    expect(screen.getByText("Aprovada")).toBeInTheDocument();
  });

  it("sem material e sem aprovação: só 'Criada por'; sem nome resolvido mostra o id", () => {
    montar({
      createdByName: undefined,
      file: undefined,
      uploadedByName: undefined,
      lastEditedBy: undefined,
      lastEditedByName: undefined,
      status: 3 as unknown as StatusEnum,
    });
    const itens = within(
      screen.getByRole("list", { name: "Pessoas da demanda" }),
    ).getAllByRole("listitem");
    expect(itens).toHaveLength(1);
    expect(itens[0]).toHaveTextContent("Criada por");
    expect(itens[0]).toHaveTextContent("u-criador");
    expect(screen.getByText("Aguardando envio")).toBeInTheDocument();
    expect(screen.getByText(/ainda não tem material/)).toBeInTheDocument();
  });
});

describe("DemandaModal — conteúdo em vídeo (049/05)", () => {
  it("vídeo: chip, player, sem Download/Visualizar, não busca o arquivo; Propor Ajuste fica", () => {
    montar({
      file: {
        id: "f1",
        originalName: "",
        uploadedBy: "u-autor",
        tipo: "video",
        videoId: "dQw4w9WgXcQ",
      },
    });
    expect(screen.getByText("Vídeo")).toBeInTheDocument();
    expect(screen.getByTestId("player")).toHaveTextContent("dQw4w9WgXcQ");
    expect(screen.queryByRole("button", { name: "Download" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Visualizar" })).toBeNull();
    expect(getFile).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Propor Ajuste" }),
    ).toBeInTheDocument();
  });

  it("documento: chip Documento, Download e Visualizar, e busca o arquivo", async () => {
    montar();
    expect(screen.getByText("Documento")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Download" }),
    ).toBeInTheDocument();
    await waitFor(() => expect(getFile).toHaveBeenCalledWith("f1", "tok"));
  });

  it("sem arquivo: nenhum chip", () => {
    montar({ file: undefined, uploadedByName: undefined });
    expect(screen.queryByText("Documento")).toBeNull();
    expect(screen.queryByText("Vídeo")).toBeNull();
  });
});

describe("DemandaModal — aba Histórico (050/04)", () => {
  it("só busca a timeline quando a aba abre, e mostra os eventos", async () => {
    montar();
    expect(getTimeline).not.toHaveBeenCalled();
    // ⚠️ mouseDown, não click: é assim que o Radix Tabs ativa no jsdom.
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Histórico" }));
    expect(await screen.findByText(/criou a demanda/)).toBeInTheDocument();
    expect(getTimeline).toHaveBeenCalledWith("d1", "tok");
    expect(getTimeline).toHaveBeenCalledTimes(1);
  });

  it("erro na timeline mostra o aviso e 'Tentar de novo' refaz a chamada", async () => {
    getTimeline
      .mockRejectedValueOnce(new Error("ms fora"))
      .mockResolvedValueOnce([]);
    montar();
    // ⚠️ mouseDown, não click: é assim que o Radix Tabs ativa no jsdom.
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Histórico" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("ms fora");
    fireEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));
    expect(
      await screen.findByText("Nada registrado ainda."),
    ).toBeInTheDocument();
    expect(getTimeline).toHaveBeenCalledTimes(2);
  });

  it("a aba Propostas não lista mais as versões do material", () => {
    montar();
    fireEvent.mouseDown(screen.getByRole("tab", { name: /Propostas/ }));
    expect(screen.queryByText("Versões do material")).toBeNull();
    expect(screen.getByText("Nenhuma proposta de ajuste.")).toBeInTheDocument();
  });
});
