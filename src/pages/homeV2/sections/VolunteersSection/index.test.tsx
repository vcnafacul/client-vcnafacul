import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("./VolunteerTile", () => ({
  VolunteerTile: ({ volunteer }: { volunteer: { name: string } }) => (
    <div>{volunteer.name}</div>
  ),
}));
vi.mock("../../../../lib/motion/motionPreference", () => ({ useIsMobile: () => false }));

import { VolunteersSection } from ".";

const data = [{ id: 1, name: "Ana", role: "", imageKey: null }];

describe("VolunteersSection", () => {
  it("sem título: o de sempre da Quem Somos", () => {
    render(<VolunteersSection id="v" data={data} />);
    expect(
      screen.getByRole("heading", { name: "Voluntários que doam tempo pela educação" }),
    ).toBeInTheDocument();
    expect(screen.getByText("QUEM FAZ ACONTECER")).toBeInTheDocument();
  });

  it("com título (página do cursinho, tickets/025)", () => {
    render(<VolunteersSection id="v" data={data} title="Nossa equipe" />);
    expect(screen.getByRole("heading", { name: "Nossa equipe" })).toBeInTheDocument();
  });
});
