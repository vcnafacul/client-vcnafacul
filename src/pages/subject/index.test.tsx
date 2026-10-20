import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Subject from ".";

const getContentOrder = vi.hoisted(() => vi.fn());
const getFile = vi.hoisted(() => vi.fn(async () => ({ arrayBuffer: async () => new ArrayBuffer(2) })));
vi.mock("../../services/content/getContent", () => ({ getContentOrder }));
vi.mock("@/services/content/getFile", () => ({ getFile }));
vi.mock("@/components/atoms/docxPreview", () => ({ default: () => <div data-testid="docx" /> }));
vi.mock("@/components/atoms/youtubePlayer", () => ({
  YoutubePlayer: ({ videoId }: { videoId: string }) => <div data-testid="player">{videoId}</div>,
}));
vi.mock("../../store/auth", () => ({ useAuthStore: () => ({ data: { token: "tok" } }) }));
vi.mock("react-toastify", () => ({ toast: { error: vi.fn() } }));

const conteudo = (id: string, title: string, file: object) => ({
  id,
  title,
  status: 1,
  subject: { name: "Funções" },
  file,
});

const montar = () =>
  render(
    <MemoryRouter initialEntries={["/dashboard/content/Funcoes/s1"]}>
      <Routes>
        <Route path="/dashboard/content/:nameSubject/:id" element={<Subject />} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  getFile.mockClear();
  getContentOrder.mockResolvedValue([
    conteudo("c1", "Aula em vídeo", { id: "f1", tipo: "video", videoId: "dQw4w9WgXcQ" }),
    conteudo("c2", "Apostila", { id: "f2", tipo: "documento", originalName: "a.docx" }),
  ]);
});

describe("página do tema — vídeo (049/05)", () => {
  it("primeiro conteúdo em vídeo: player, sem buscar arquivo; ícone ▶ só no vídeo", async () => {
    montar();
    expect(await screen.findByTestId("player")).toHaveTextContent("dQw4w9WgXcQ");
    expect(getFile).not.toHaveBeenCalled();
    expect(screen.getByText(/1 - Aula em vídeo/).querySelector("svg")).not.toBeNull();
    expect(screen.getByText(/2 - Apostila/).querySelector("svg")).toBeNull();
  });

  it("clicar no documento busca o arquivo e renderiza o docx no lugar do player", async () => {
    montar();
    await screen.findByTestId("player");
    fireEvent.click(await screen.findByText(/2 - Apostila/));
    await waitFor(() => expect(getFile).toHaveBeenCalledWith("f2", "tok"));
    expect(await screen.findByTestId("docx")).toBeInTheDocument();
    expect(screen.queryByTestId("player")).toBeNull();
  });
});
