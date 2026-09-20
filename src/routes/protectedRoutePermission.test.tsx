import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { DASH } from "./path";
import ProtectedRoutePermission from "./protectedRoutePermission";

/**
 * ⚠️ Primeiro teste de `src/routes/`. Até o card `10` nada afirmava o
 * comportamento deste guard, e ele passou a proteger sete rotas a mais —
 * incluindo as telas de turma, colaboradores e processos seletivos.
 */
const montar = (permission: boolean) =>
  render(
    <MemoryRouter initialEntries={["/protegida"]}>
      <Routes>
        <Route
          path="/protegida"
          element={
            <ProtectedRoutePermission permission={permission}>
              <div>conteúdo secreto</div>
            </ProtectedRoutePermission>
          }
        />
        <Route path={DASH} element={<div>dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe("ProtectedRoutePermission", () => {
  it("com a permissão, renderiza a tela", () => {
    montar(true);

    expect(screen.getByText("conteúdo secreto")).toBeInTheDocument();
  });

  it("⚠️ sem a permissão, a tela NÃO é renderizada", () => {
    // é o que o card `10` compra: até ele, sete rotas de cursinho montavam
    // para qualquer pessoa logada e só falhavam nas chamadas de api
    montar(false);

    expect(screen.queryByText("conteúdo secreto")).not.toBeInTheDocument();
  });

  it("⚠️ e o desvio é CALADO — some para o dashboard sem dizer nada", () => {
    // Documenta o defeito, não o aprova: é o card `15`. Um link compartilhado
    // com quem não tem a permissão desaparece sem explicação, e a leitura
    // natural é "o link está quebrado".
    //
    // Quando o `15` for feito, este teste MUDA — e é essa a intenção: ele
    // falha e obriga quem consertar a dizer o que passou a acontecer.
    montar(false);

    expect(screen.getByText("dashboard")).toBeInTheDocument();
  });
});
