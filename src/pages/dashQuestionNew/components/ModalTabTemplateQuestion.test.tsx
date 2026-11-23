import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ModalTabTemplateQuestion from "./ModalTabTemplateQuestion";

const montar = (extra: Record<string, unknown> = {}) => {
  const fechar = vi.fn();
  render(
    <ModalTabTemplateQuestion
      isOpen
      tabs={[
        { id: "a", label: "Aba A", children: <p>conteúdo A</p>, handleClose: fechar },
        { id: "b", label: "Aba B", children: <p>conteúdo B</p>, handleClose: fechar },
      ]}
      {...extra}
    />,
  );
  return { fechar };
};

describe("ModalTabTemplateQuestion (Dialog)", () => {
  it("abre como diálogo, com o aviso no banner e a primeira aba", () => {
    montar({ aviso: <p>aviso fixo</p> });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("aviso fixo")).toBeInTheDocument();
    expect(screen.getByText("conteúdo A")).toBeInTheDocument();
    expect(screen.queryByText("conteúdo B")).toBeNull();
  });

  it("troca de aba sozinha quando não é controlada", () => {
    montar();
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Aba B" }));
    expect(screen.getByText("conteúdo B")).toBeInTheDocument();
  });

  it("controlada de fora: segue abaAtiva e avisa onAbaChange", () => {
    const onAbaChange = vi.fn();
    montar({ abaAtiva: "b", onAbaChange });
    expect(screen.getByText("conteúdo B")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Aba A" }));
    expect(onAbaChange).toHaveBeenCalledWith("a");
  });

  it("o X fecha pelo handleClose da aba", () => {
    const { fechar } = montar();
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    expect(fechar).toHaveBeenCalled();
  });
});
