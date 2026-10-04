import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";
import { EmptyState as EmptyStateRedacao } from "../classEssayAnalytics/EmptyState";

const AVISO = "Os dados ainda não foram gerados. Quem gerencia turmas pode gerar.";

describe("Desempenho sem Gerenciar Turmas (tickets-documentacao, 07)", () => {
  it("simulado: com permissão, botão Gerar agora", () => {
    render(<EmptyState variant="no-months" onGenerate={() => {}} />);
    expect(screen.getByText("Gerar agora")).toBeInTheDocument();
  });

  it("⚠️ simulado: sem permissão, aviso no lugar do botão", () => {
    render(<EmptyState variant="no-months" aviso={AVISO} />);
    expect(screen.queryByText("Gerar agora")).toBeNull();
    expect(screen.getByText(AVISO)).toBeInTheDocument();
  });

  it("⚠️ redação: sem permissão, aviso no lugar do botão", () => {
    render(<EmptyStateRedacao variant="no-months" aviso={AVISO} />);
    expect(screen.queryByText("Gerar agora")).toBeNull();
    expect(screen.getByText(AVISO)).toBeInTheDocument();
  });
});
