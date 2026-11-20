import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PermissionType } from "@/dtos/roles/permissionHierarchy";
import PermissaoSwitch from "./PermissaoSwitch";

describe("PermissaoSwitch", () => {
  it("somente leitura: linha estática em contraste total, com o estado em texto e o tipo", () => {
    render(
      <PermissaoSwitch
        label="Criar questão"
        checked
        readonly
        type={PermissionType.project}
        mostrarTipo
      />,
    );
    expect(screen.queryByRole("switch")).toBeNull();
    expect(screen.getByText("concedida")).toBeInTheDocument();
    expect(screen.getByText("Projeto")).toBeInTheDocument();
  });

  it("somente leitura, não concedida", () => {
    render(<PermissaoSwitch label="Criar questão" checked={false} readonly />);
    expect(screen.getByText("não concedida")).toBeInTheDocument();
    expect(screen.queryByText("Cursinho")).toBeNull();
  });

  it("implícita: chave ligada e travada, nome lido com '(auto)'", () => {
    render(<PermissaoSwitch label="Criar questão" checked={false} implied />);
    const chave = screen.getByRole("switch", { name: "Criar questão (auto)" });
    expect(chave).toBeDisabled();
    expect(chave).toHaveAttribute("aria-checked", "true");
  });

  it("editável: liga pela chave", () => {
    const onChange = vi.fn();
    render(<PermissaoSwitch label="Criar questão" checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole("switch", { name: "Criar questão" }));
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
