import { fireEvent, render, screen } from "@testing-library/react";
import { Users } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

// ⚠️ O Popover do Radix custa segundos de CPU no jsdom (chegou a 52 s no
// test:ci). Aqui interessa o conteúdo do (i), não o posicionamento: um popover
// de mentira que abre no clique basta.
vi.mock("@/components/ui/popover", async () => {
  const { createContext, useContext, useState } = await import("react");
  const Aberto = createContext<[boolean, (v: boolean) => void]>([
    false,
    () => {},
  ]);
  return {
    Popover: ({ children }: { children: React.ReactNode }) => (
      <Aberto.Provider value={useState(false)}>{children}</Aberto.Provider>
    ),
    PopoverTrigger: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
      const [aberto, setAberto] = useContext(Aberto);
      return (
        <button {...props} type="button" onClick={() => setAberto(!aberto)} />
      );
    },
    PopoverContent: ({ children }: { children: React.ReactNode }) =>
      useContext(Aberto)[0] ? <div>{children}</div> : null,
  };
});

import { CardDeMetrica } from "./CardDeMetrica";
describe("CardDeMetrica", () => {
  it("(i) abre a explicação em linguagem do cursinho; sem dado mostra traço", async () => {
    render(
      <CardDeMetrica
        icon={Users}
        rotulo="Alunos no período"
        valor={null}
        explicacao={{
          oQueE: "quantos alunos tiveram a matrícula confirmada",
          comoContamos: "todo aluno matriculado em uma turma do período",
          ficaDeFora: "quem não confirmou a matrícula",
        }}
      />,
    );

    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.getByText("Sem dado ainda")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Como calculamos: Alunos no período" }),
    );
    expect(
      await screen.findByText("quem não confirmou a matrícula"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Fica de fora/)).toBeInTheDocument();
  });
});
