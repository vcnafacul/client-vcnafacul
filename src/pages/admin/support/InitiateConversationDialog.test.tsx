import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InitiateConversationDialog } from "./InitiateConversationDialog";

vi.mock("@/store/auth", () => ({
  useAuthStore: (sel: (s: { data: { token: string } }) => unknown) =>
    sel({ data: { token: "tok" } }),
}));
vi.mock("@/services/chat/initiateConversation", () => ({
  initiateConversation: vi.fn(),
}));
vi.mock("@/services/auth/getUserByName", () => ({
  getUserByName: vi.fn(async () => [
    { id: "u1", name: "Ana Souza", email: "ana@x.com" },
  ]),
}));

describe("InitiateConversationDialog — foco", () => {
  it("re-render com o foco num resultado não devolve o foco ao campo de busca", async () => {
    const props = { open: true, onOpenChange: vi.fn(), onCreated: vi.fn() };
    const { rerender } = render(<InitiateConversationDialog {...props} />);

    const busca = screen.getByPlaceholderText("Digite ao menos 2 caracteres");
    await waitFor(() => expect(busca).toHaveFocus());
    fireEvent.change(busca, { target: { value: "Ana" } });
    const resultado = await screen.findByRole("button", { name: /Ana Souza/ });
    resultado.focus();
    expect(resultado).toHaveFocus();

    rerender(<InitiateConversationDialog {...props} onCreated={vi.fn()} />);
    expect(resultado).toHaveFocus();
  });

  it("ao trocar de etapa, o foco vai para a mensagem", async () => {
    render(
      <InitiateConversationDialog open onOpenChange={vi.fn()} onCreated={vi.fn()} />,
    );
    fireEvent.change(screen.getByPlaceholderText("Digite ao menos 2 caracteres"), { target: { value: "Ana" } });
    fireEvent.click(await screen.findByRole("button", { name: /Ana Souza/ }));
    const msg = await screen.findByPlaceholderText("Digite a mensagem inicial");
    await waitFor(() => expect(msg).toHaveFocus());
  });
});
