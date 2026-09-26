import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Step2 from "./step2";
import { UserRegister } from "@/types/user/userRegister";

vi.mock("@/hooks/useToastAsync", () => ({ useToastAsync: () => vi.fn() }));
// O calendário do primereact pede o locale pt-br registrado no boot do app
vi.mock("@/components/atoms/controlCalendar", () => ({ default: () => null }));

// O checkbox do Radix (nome social) mede o próprio tamanho; o jsdom não tem
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

const montar = (props: Partial<Parameters<typeof Step2>[0]> = {}) =>
  render(
    <Step2
      dataUser={{} as UserRegister}
      next={vi.fn()}
      onRegister={vi.fn()}
      {...props}
    />,
  );

describe("Step2 do cadastro — reuso no cadastro pelo Google", () => {
  it("com back (cadastro normal): tem Voltar", () => {
    montar({ back: vi.fn() });
    expect(screen.getByText("Voltar")).toBeTruthy();
  });

  it("⚠️ sem back (cadastro pelo Google): não tem Voltar", () => {
    montar();
    expect(screen.queryByText("Voltar")).toBeNull();
  });

  it("valoresIniciais preenchem nome e sobrenome", () => {
    const { container } = montar({
      valoresIniciais: { firstName: "Ana", lastName: "Silva" },
    });
    expect((container.querySelector("#firstName") as HTMLInputElement).value).toBe("Ana");
    expect((container.querySelector("#lastName") as HTMLInputElement).value).toBe("Silva");
  });
});
