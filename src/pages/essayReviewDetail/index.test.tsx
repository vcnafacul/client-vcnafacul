import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "t", user: { email: "eu@x.com" } } }),
}));
const warn = vi.hoisted(() => vi.fn());
vi.mock("react-toastify", () => ({
  toast: { warn, error: vi.fn(), success: vi.fn() },
}));
const createHumanReview = vi.hoisted(() => vi.fn(async () => undefined));
vi.mock("@/services/essay", () => ({
  getEssayById: vi.fn(async () => ({
    id: "e1",
    title: "Minha redação",
    status: "SUBMITTED",
    inputType: "TYPED",
    text: "texto",
    theme: { title: "Tema" },
  })),
  getEssayReviews: vi.fn(async () => []),
  createHumanReview,
  downloadEssayImage: vi.fn(),
}));

import EssayReviewDetail from ".";

const montar = async () => {
  render(
    <MemoryRouter initialEntries={["/r/e1"]}>
      <Routes>
        <Route path="/r/:id" element={<EssayReviewDetail />} />
      </Routes>
    </MemoryRouter>,
  );
  await screen.findByText("Nova Revisão");
};

const preencher = () => {
  for (const campo of screen.getAllByPlaceholderText("Feedback...")) {
    fireEvent.change(campo, { target: { value: "ok" } });
  }
  for (const campo of screen.getAllByPlaceholderText(
    "Sugestão de melhoria...",
  )) {
    fireEvent.change(campo, { target: { value: "ok" } });
  }
  fireEvent.change(
    screen.getByPlaceholderText("Comentário geral sobre a redação..."),
    { target: { value: "ok" } },
  );
};

describe("EssayReviewDetail — enviar revisão", () => {
  it("incompleto: avisa e não abre a confirmação", async () => {
    await montar();
    fireEvent.click(screen.getByRole("button", { name: "Enviar revisão" }));
    expect(warn).toHaveBeenCalled();
    expect(screen.queryByText(/Enviar revisão com nota/)).toBeNull();
  });

  it("completo: confirma com a nota antes de enviar", async () => {
    await montar();
    preencher();
    fireEvent.click(screen.getByRole("button", { name: "Enviar revisão" }));
    expect(
      screen.getByText("Enviar revisão com nota 0/1000?"),
    ).toBeInTheDocument();
    expect(createHumanReview).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    await vi.waitFor(() => expect(createHumanReview).toHaveBeenCalled());
  });
});
