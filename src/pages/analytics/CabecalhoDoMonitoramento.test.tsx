import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { escolherOpcao } from "@/test/radix";
import { Period } from "@/enums/analytics/period";
import { CabecalhoDoMonitoramento } from "./CabecalhoDoMonitoramento";

describe("CabecalhoDoMonitoramento", () => {
  it("escolhe o período pelo Select do design system", () => {
    const onPeriod = vi.fn();
    render(
      <CabecalhoDoMonitoramento
        period={Period.month}
        onPeriod={onPeriod}
        cursinhos={[]}
        cursinho={null}
        onCursinho={vi.fn()}
      />,
    );
    const gatilho = screen.getByRole("combobox", { name: "Período" });
    expect(gatilho).toHaveTextContent("Mensal");
    escolherOpcao(gatilho, "Anual");
    expect(onPeriod).toHaveBeenCalledWith(Period.year);
  });
});
