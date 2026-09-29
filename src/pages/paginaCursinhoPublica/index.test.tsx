import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const svc = vi.hoisted(() => ({
  getPaginaPublica: vi.fn(),
  getLinksInternos: vi.fn(),
}));
vi.mock("@/services/paginaCursinho", () => svc);
const auth = vi.hoisted(() => ({ token: "" }));
vi.mock("@/store/auth", () => ({
  useAuthStore: (sel: (s: unknown) => unknown) => sel({ data: { token: auth.token } }),
}));
vi.mock("@/components/templates/baseTemplate", () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));
vi.mock("@/components/atoms/richTextRenderer/RichTextRenderer", () => ({
  default: ({ content }: { content: string }) => <div>{content}</div>,
}));
const grade = vi.hoisted(() => ({ props: null as null | Record<string, unknown> }));
vi.mock("@/pages/homeV2/sections/VolunteersSection", () => ({
  VolunteersSection: (p: Record<string, unknown>) => {
    grade.props = p;
    return <div>grade de colaboradores</div>;
  },
}));

import PaginaCursinhoPublica from ".";

const pagina = (over = {}) => ({
  cursinhoId: "A",
  slug: "meu",
  nome: "Cursinho São João",
  localizacao: "São Paulo - SP",
  quemSomos: "Somos um cursinho popular.",
  redes: [{ rede: "instagram", url: "instagram.com/meu" }],
  linksPublicos: [{ titulo: "Site", url: "https://site.org" }],
  colaboradores: [
    { name: "Ana", description: "Coord.", image: "k1" },
    { name: "Beto", description: null, image: null },
  ],
  impacto: {
    estudantesAtendidos: 1234,
    estudantesAtivos: 12,
    questoesAprovadas: null,
    processosSeletivos: 3,
  },
  ...over,
});

const abrir = () =>
  render(
    <MemoryRouter initialEntries={["/cursinho/meu"]}>
      <Routes>
        <Route path="/cursinho/:slug" element={<PaginaCursinhoPublica />} />
      </Routes>
    </MemoryRouter>,
  );

describe("Página pública do cursinho (025 · 07)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.token = "";
    grade.props = null;
  });

  it("monta nome, localização, quem somos, impacto, links e redes", async () => {
    svc.getPaginaPublica.mockResolvedValue(pagina());
    abrir();

    expect(
      await screen.findByRole("heading", { level: 1, name: "Cursinho São João" }),
    ).toBeInTheDocument();
    expect(svc.getPaginaPublica).toHaveBeenCalledWith("meu");
    expect(screen.getByText("São Paulo - SP")).toBeInTheDocument();
    expect(screen.getByText("Somos um cursinho popular.")).toBeInTheDocument();

    const impacto = screen.getByRole("region", { name: "Impacto" });
    expect(within(impacto).getByText("1.234")).toBeInTheDocument();
    expect(within(impacto).getByText("Questões revisadas e aprovadas")).toBeInTheDocument();
    expect(within(impacto).getByText("—")).toBeInTheDocument(); // null do ms
    expect(within(impacto).queryByText("Cursinhos parceiros")).toBeNull();

    expect(screen.getByRole("link", { name: /Site/ })).toHaveAttribute(
      "href",
      "https://site.org",
    );
    // rede cadastrada sem protocolo ganha https://
    expect(screen.getByRole("link", { name: "Instagram" })).toHaveAttribute(
      "href",
      "https://instagram.com/meu",
    );
  });

  it("colaboradores vão para a grade da Quem Somos, com título próprio e foto nula", async () => {
    svc.getPaginaPublica.mockResolvedValue(pagina());
    abrir();
    await screen.findByText("grade de colaboradores");
    expect(grade.props).toMatchObject({
      title: "Nossa equipe",
      data: [
        { id: 0, name: "Ana", role: "Coord.", imageKey: "k1" },
        { id: 1, name: "Beto", role: "", imageKey: null },
      ],
    });
  });

  it("sem colaboradores, sem links e sem redes: as seções não aparecem", async () => {
    svc.getPaginaPublica.mockResolvedValue(
      pagina({ colaboradores: [], linksPublicos: [], redes: [] }),
    );
    abrir();
    await screen.findByRole("heading", { level: 1 });
    expect(screen.queryByText("grade de colaboradores")).toBeNull();
    expect(screen.queryByRole("region", { name: "Links úteis" })).toBeNull();
    expect(screen.queryByRole("region", { name: "Redes sociais" })).toBeNull();
  });

  it("404 da api → Página não encontrada", async () => {
    svc.getPaginaPublica.mockResolvedValue(null);
    abrir();
    expect(await screen.findByText("Página não encontrada")).toBeInTheDocument();
  });

  it("⚠️ deslogado nem pergunta pelos links internos", async () => {
    svc.getPaginaPublica.mockResolvedValue(pagina());
    abrir();
    await screen.findByRole("heading", { level: 1 });
    expect(svc.getLinksInternos).not.toHaveBeenCalled();
    expect(screen.queryByRole("region", { name: "Links internos" })).toBeNull();
  });

  it("logado sem vínculo (403 → null): a seção não aparece", async () => {
    auth.token = "tk";
    svc.getPaginaPublica.mockResolvedValue(pagina());
    svc.getLinksInternos.mockResolvedValue(null);
    abrir();
    await waitFor(() => expect(svc.getLinksInternos).toHaveBeenCalledWith("meu", "tk"));
    expect(screen.queryByRole("region", { name: "Links internos" })).toBeNull();
  });

  it("logado com vínculo: mostra os links internos", async () => {
    auth.token = "tk";
    svc.getPaginaPublica.mockResolvedValue(pagina());
    svc.getLinksInternos.mockResolvedValue([{ titulo: "Drive", url: "https://drive" }]);
    abrir();
    const secao = await screen.findByRole("region", { name: "Links internos" });
    expect(within(secao).getByRole("link", { name: /Drive/ })).toHaveAttribute(
      "href",
      "https://drive",
    );
  });
});
