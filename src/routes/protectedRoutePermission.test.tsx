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

  it("sem a permissão, vai para a dash principal", () => {
    // ⚠️ **Decisão, não defeito.** Foi aberto um card para construir uma página
    // de acesso negado e ele foi **cancelado**: o desvio para a dash é o
    // comportamento desejado para quem chegou à rota sem poder estar nela.
    //
    // ⚠️ O custo conhecido: o relatório do card `06` é uma rota própria para o
    // link poder ser compartilhado, e mandado a quem não tem
    // `gerenciarEstudantes` ele some sem explicação. Aceito, por escrito, para
    // ninguém "consertar" isto achando que foi esquecimento.
    montar(false);

    expect(screen.getByText("dashboard")).toBeInTheDocument();
  });
});
