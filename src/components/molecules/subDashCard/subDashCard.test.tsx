import { SidebarProvider } from "@/components/ui/sidebar";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SubDashCard from ".";

const Icone = () => null;

const renderizar = (caminho: string, link: string, blank = false) =>
  render(
    <MemoryRouter initialEntries={[caminho]}>
      <SidebarProvider>
        <SubDashCard
          blank={blank}
          subCardInfo={{ icon: Icone, alt: "x", text: "Item", link }}
        />
      </SidebarProvider>
    </MemoryRouter>,
  );

const item = () => screen.getByRole("link", { name: "Item" });

describe("SubDashCard — página atual", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }) as never;
  });

  it("destaca o item da página aberta", () => {
    renderizar("/dashboard/turmas", "/dashboard/turmas");

    expect(item()).toHaveAttribute("aria-current", "page");
    expect(item()).toHaveClass("text-marine");
  });

  it("subpágina (detalhe) também acende o item", () => {
    renderizar("/dashboard/turmas/abc123", "/dashboard/turmas");

    expect(item()).toHaveClass("text-marine");
  });

  it("outra página não destaca", () => {
    renderizar("/dashboard/colaboradores", "/dashboard/turmas");

    expect(item()).not.toHaveAttribute("aria-current");
    expect(item()).not.toHaveClass("text-marine");
  });

  it("⚠️ prefixo de texto não conta: suporte-cursinho não acende suporte", () => {
    renderizar("/dashboard/suporte-cursinho", "/dashboard/suporte");

    expect(item()).not.toHaveClass("text-marine");
  });
});
