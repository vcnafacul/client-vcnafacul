import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Step1 from "./step1";

vi.mock("@/services/auth/validNewEmail", () => ({
  validNewEmail: vi.fn().mockResolvedValue(undefined),
}));

describe("Step1 — email travado (convite 05)", () => {
  it("⚠️ com convite, o email aparece como texto — não há campo para trocar", () => {
    const { container } = render(
      <Step1 updateData={vi.fn()} dataUser={{} as any} emailTravado="ana@x.com" />,
    );

    expect(container.querySelector("[data-email-travado]")?.textContent).toContain(
      "ana@x.com",
    );
    expect(container.querySelector("#email")).toBeNull();
  });

  it("sem convite, o campo de email de sempre", () => {
    const { container } = render(
      <Step1 updateData={vi.fn()} dataUser={{} as any} />,
    );

    expect(container.querySelector("[data-email-travado]")).toBeNull();
    expect(container.querySelector("#email")).toBeTruthy();
  });
});
