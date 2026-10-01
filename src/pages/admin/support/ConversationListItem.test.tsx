import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ConversationDoc } from "@/services/firebase/conversations";
import { ConversationListItem } from "./ConversationListItem";

const nome = "Cursinho Popular Pré-Vestibular da UFSCar";
const conv = {
  id: "c1",
  userName: "Ana",
  status: "open",
  originLabel: "Declaração de interesse",
  cursinhoName: nome,
} as ConversationDoc;

const montar = (c: ConversationDoc, showCursinho?: boolean) =>
  render(
    <ConversationListItem
      conv={c}
      selected={false}
      onClick={() => {}}
      showCursinho={showCursinho}
    />,
  );

describe("ConversationListItem", () => {
  it("com showCursinho: cursinho em linha própria, nome completo no hover", () => {
    montar(conv, true);
    expect(screen.getByText(nome)).toHaveAttribute("title", nome);
    expect(screen.getByText("Declaração de interesse")).toBeInTheDocument();
  });

  it("com showCursinho e sem cursinho: 'Sem cursinho vinculado'", () => {
    montar({ ...conv, cursinhoName: null } as ConversationDoc, true);
    expect(screen.getByText("Sem cursinho vinculado")).toBeInTheDocument();
  });

  it("sem showCursinho: origem e cursinho na mesma linha, como antes", () => {
    montar({ ...conv, cursinhoName: null } as ConversationDoc);
    expect(screen.queryByText("Sem cursinho vinculado")).toBeNull();
    montar(conv);
    expect(
      screen.getByText(`Declaração de interesse · ${nome}`),
    ).toBeInTheDocument();
  });
});
