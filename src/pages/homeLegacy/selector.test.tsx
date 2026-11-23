import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Selector from "@/components/molecules/selector";

describe("Selector (Tabs no desktop)", () => {
  it("mostra as seções como abas, marca a ativa e avisa a troca pelo índice", () => {
    const changeItem = vi.fn();
    render(<Selector tabItems={["Um", "Dois", "Três"]} activeTab={1} changeItem={changeItem} />);
    expect(screen.getByRole("tab", { name: "Dois" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Um" })).toHaveAttribute("aria-selected", "false");
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Três" }));
    expect(changeItem).toHaveBeenCalledWith(2);
  });
});
