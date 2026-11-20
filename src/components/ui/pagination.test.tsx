import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  Pagination,
  PaginationContent,
  PaginationControls,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

describe("Pagination", () => {
  it('"Anterior" e "Próxima" são <button>', () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious onClick={vi.fn()} />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext onClick={vi.fn()} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    const anterior = screen.getByRole("button", { name: "Página anterior" });
    const proxima = screen.getByRole("button", { name: "Próxima página" });
    expect(anterior.tagName).toBe("BUTTON");
    expect(proxima.tagName).toBe("BUTTON");
    expect(anterior).toHaveTextContent("Anterior");
    expect(proxima).toHaveTextContent("Próxima");
  });

  it("com href continua um link de verdade", () => {
    render(<PaginationNext href="#pagina-2" />);
    expect(screen.getByRole("link", { name: "Próxima página" })).toHaveAttribute("href", "#pagina-2");
  });

  it("PaginationControls marca a página atual e desabilita as pontas", () => {
    const onPageChange = vi.fn();
    render(<PaginationControls page={1} totalPages={5} onPageChange={onPageChange} />);

    expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "5" }));
    expect(onPageChange).toHaveBeenCalledWith(5);
    fireEvent.click(screen.getByRole("button", { name: "Próxima página" }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);
  });
});
