import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ConversationDoc } from "@/services/firebase/conversations";

const acima = vi.hoisted(() => ({ valor: false }));
vi.mock("@/components/dashV2/useAcimaDeSm", () => ({
  useAcimaDeSm: () => acima.valor,
}));
// O chat real fala com o Firebase; aqui só importa o que a view passa a ele.
vi.mock("@/components/chat/ChatLayout", () => ({
  ChatLayout: ({
    title,
    subtitle,
    cursinhoLine,
    cursinhoMissing,
    onBack,
  }: {
    title: string;
    subtitle?: string;
    cursinhoLine?: string;
    cursinhoMissing?: boolean;
    onBack?: () => void;
  }) => (
    <div data-testid="chat">
      {title}
      {subtitle && <span data-testid="subtitle">{subtitle}</span>}
      {cursinhoLine && (
        <span data-testid="cursinho" data-missing={String(!!cursinhoMissing)}>
          {cursinhoLine}
        </span>
      )}
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

const montar = (selected: ConversationDoc | null, showCursinho = false) => {
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
      showCursinho={showCursinho}
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

describe("SupportInboxView: cursinho no cabeçalho", () => {
  const comCursinho = {
    ...conv,
    originLabel: "Declaração de interesse",
    cursinhoName: "Cursinho Popular Pré-Vestibular da UFSCar",
  } as ConversationDoc;

  it("inbox do admin: cursinho em linha própria, fora dos chips", () => {
    acima.valor = true;
    montar(comCursinho, true);
    expect(screen.getByTestId("cursinho")).toHaveTextContent(
      "Cursinho Popular Pré-Vestibular da UFSCar",
    );
    expect(screen.getByTestId("cursinho")).toHaveAttribute(
      "data-missing",
      "false",
    );
    expect(screen.getByTestId("subtitle")).toHaveTextContent(
      /^Declaração de interesse$/,
    );
  });

  it("inbox do admin: conversa sem cursinho diz isso", () => {
    acima.valor = true;
    montar({ ...conv, cursinhoName: null } as ConversationDoc, true);
    expect(screen.getByTestId("cursinho")).toHaveTextContent(
      "Sem cursinho vinculado",
    );
    expect(screen.getByTestId("cursinho")).toHaveAttribute(
      "data-missing",
      "true",
    );
  });

  it("inbox do cursinho: igual a antes", () => {
    acima.valor = true;
    montar(comCursinho);
    expect(screen.queryByTestId("cursinho")).toBeNull();
    expect(screen.getByTestId("subtitle")).toHaveTextContent(
      "Declaração de interesse · Cursinho Popular Pré-Vestibular da UFSCar",
    );
  });
});
