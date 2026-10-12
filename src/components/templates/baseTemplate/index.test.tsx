import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../organisms/header", () => ({ default: () => <header /> }));
vi.mock("../../organisms/footer", () => ({ default: () => <footer /> }));

import BaseTemplate from ".";

describe("BaseTemplate", () => {
  it("mostra o rodapé por padrão", () => {
    render(<BaseTemplate solid>conteúdo</BaseTemplate>);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("hideFooter tira o rodapé (Localiza Cursinho)", () => {
    render(
      <BaseTemplate solid hideFooter>
        conteúdo
      </BaseTemplate>,
    );
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
    expect(screen.getByText("conteúdo")).toBeInTheDocument();
  });
});
