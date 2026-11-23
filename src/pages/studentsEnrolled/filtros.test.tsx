import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StatusApplication } from "@/enums/prepCourse/statusApplication";

import { cloneElement, createContext, useContext, type ReactElement, type ReactNode } from "react";

/* Dublê do Popover: o Popper do Radix é lento no jsdom; aqui importa a escolha, não o posicionamento. */
vi.mock("@/components/ui/popover", () => {
  const Ctx = createContext<{ open: boolean; set: (v: boolean) => void }>({
    open: false,
    set: () => {},
  });
  return {
    Popover: ({ open, onOpenChange, children }: { open: boolean; onOpenChange: (v: boolean) => void; children: ReactNode }) => (
      <Ctx.Provider value={{ open, set: onOpenChange }}>{children}</Ctx.Provider>
    ),
    PopoverTrigger: ({ children }: { children: ReactElement<{ onClick?: () => void }> }) => {
      const { open, set } = useContext(Ctx);
      return cloneElement(children, { onClick: () => set(!open) });
    },
    PopoverContent: ({ children }: { children: ReactNode }) =>
      useContext(Ctx).open ? <div>{children}</div> : null,
  };
});

const getStudentsEnrolled = vi.fn();

vi.mock("@/hooks/use-above-sm", () => ({
  SM_QUERY: "(min-width: 768px)",
  useAboveSm: () => false,
}));
vi.mock("@/hooks/useToastAsync", () => ({
  useToastAsync:
    () =>
    async ({
      action,
      onSuccess,
    }: {
      action: () => Promise<unknown>;
      onSuccess?: (r: unknown) => void;
    }) => {
      const r = await action();
      onSuccess?.(r);
    },
}));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "t", permissao: {} } }),
}));
vi.mock("@/services/prepCourse/student/getStudentsEnrolled", () => ({
  getStudentsEnrolled: (...a: unknown[]) => getStudentsEnrolled(...a),
}));
vi.mock("@/services/prepCourse/inscription/getAllWithName", () => ({
  getAllWithName: async () => [],
}));
vi.mock("@/services/prepCourse/coursePeriod/getCoursePeriodYears", () => ({
  getCoursePeriodYears: async () => [],
}));
vi.mock("@/services/prepCourse/prepCourse/getPartnerLogo", () => ({
  getPartnerLogo: async () => new Blob(),
}));
vi.mock("heic2any", () => ({ default: vi.fn() }));
import { StudentsEnrolled } from ".";

describe("StudentsEnrolled — filtros", () => {
  beforeEach(() => {
    getStudentsEnrolled.mockReset();
    getStudentsEnrolled.mockResolvedValue({
      name: "Cursinho",
      partnerId: null,
      students: {
        totalItems: 1,
        data: [
          {
            id: "e-1",
            name: "Estudante Um",
            email: "e1@x.com",
            whatsapp: "11 99999-0000",
            cod_enrolled: "M1",
            applicationStatus: StatusApplication.Enrolled,
          },
        ],
      },
    });
  });

  it("escolher de novo a opção atual não esvazia a lista", async () => {
    render(<StudentsEnrolled />);
    await screen.findByText("Estudante Um");

    const gatilho = screen.getByRole("combobox", { name: "Status" });
    fireEvent.click(gatilho);
    fireEvent.click(await screen.findByRole("option", { name: "Todos os status" }));

    await new Promise((r) => setTimeout(r, 50));
    expect(screen.getByText("Estudante Um")).toBeInTheDocument();
  });

  it("trocar o status recarrega a lista", async () => {
    render(<StudentsEnrolled />);
    await screen.findByText("Estudante Um");
    const chamadas = getStudentsEnrolled.mock.calls.length;

    const gatilho = screen.getByRole("combobox", { name: "Status" });
    fireEvent.click(gatilho);
    fireEvent.click(
      await screen.findByRole("option", { name: StatusApplication.Enrolled }),
    );

    await waitFor(() =>
      expect(getStudentsEnrolled.mock.calls.length).toBeGreaterThan(chamadas),
    );
    expect(await screen.findByText("Estudante Um")).toBeInTheDocument();
  });
});
