import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ConversationDoc } from "@/services/firebase/conversations";

const acima = vi.hoisted(() => ({ valor: false }));
vi.mock("@/components/dashV2/useAcimaDeSm", () => ({
  useAcimaDeSm: () => acima.valor,
}));
// O chat real fala com o Firebase; aqui só importa o que a view passa a ele.
vi.mock("@/components/chat/ChatLayout", () => ({
  ChatLayout: ({ title, onBack }: { title: string; onBack?: () => void }) => (
    <div data-testid="chat">
      {title}
      {onBack && <button onClick={onBack}>Voltar para a lista</button>}
    </div>
  ),
}));
vi.mock("@/pages/admin/support/ConversationListItem", () => ({
  ConversationListItem: ({
    conv,
    onClick,
  }: {
    conv: ConversationDoc;
    onClick: () => void;
  }) => <button onClick={onClick}>{conv.userName}</button>,
}));

import { SupportInboxView } from "./SupportInboxView";

const conv = { id: "c1", userName: "Ana", status: "open" } as ConversationDoc;

const montar = (selected: ConversationDoc | null) => {
  const onClose = vi.fn();
  const onSelect = vi.fn();
  render(
    <SupportInboxView
      title="Suporte"
      convs={[conv]}
      sorted={[conv]}
      selected={selected}
      selectedId={selected?.id ?? null}
      onSelect={onSelect}
      onClose={onClose}
      search=""
      onSearchChange={vi.fn()}
      userId="u1"
      activeTab="active"
      onTabChange={vi.fn()}
      archivedCount={0}
    />,
  );
  return { onClose, onSelect };
};

describe("SupportInboxView no celular", () => {
  it("sem conversa aberta: só a lista", () => {
    acima.valor = false;
    const { onSelect } = montar(null);
    expect(screen.queryByText("Selecione uma conversa")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Ana" }));
    expect(onSelect).toHaveBeenCalledWith("c1");
  });

  it("com conversa aberta: só o chat, com ← que volta sem encerrar", () => {
    acima.valor = false;
    const { onClose } = montar(conv);
    expect(screen.getByTestId("chat")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Buscar por nome...")).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Voltar para a lista" }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("a partir de 768px: lado a lado e sem ←", () => {
    acima.valor = true;
    montar(conv);
    expect(
      screen.getByPlaceholderText("Buscar por nome..."),
    ).toBeInTheDocument();
    expect(screen.getByTestId("chat")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Voltar para a lista" }),
    ).toBeNull();
  });
});
