import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/dashV2/useAcimaDeSm", () => ({
  useAcimaDeSm: () => false,
}));
vi.mock("@/store/auth", () => ({
  useAuthStore: () => ({ data: { token: "t", user: { email: "eu@x.com" } } }),
}));
const redacao = (id: string, reviews: unknown[] = []) => ({
  id,
  status: "SUBMITTED",
  submittedAt: new Date(2026, 8, 1).toISOString(),
  user: { firstName: "Ana", lastName: `Silva ${id}`, email: `ana${id}@x.com` },
  theme: { title: "Tema A" },
  reviews,
});
vi.mock("@/services/essay", () => ({
  getAllEssays: vi.fn(),
  getMyCursinhoEssays: vi.fn(async () => ({
    data: [
      redacao("1"),
      redacao("2", [{ reviewType: "HUMAN", reviewer: { email: "eu@x.com" } }]),
    ],
    total: 2,
  })),
  getThemes: vi.fn(async () => ({ data: [] })),
}));

import EssayReviewList from ".";

describe("EssayReviewList no celular", () => {
  it("cards com Ver e Revisar à vista; sem Revisar para quem já revisou", async () => {
    render(
      <MemoryRouter>
        <EssayReviewList mode="cursinho" />
      </MemoryRouter>,
    );
    const cards = await screen.findAllByRole("listitem");
    expect(screen.queryByRole("table")).toBeNull();
    expect(cards).toHaveLength(2);

    const primeiro = within(cards[0]);
    expect(primeiro.getByText("Ana Silva 1")).toBeInTheDocument();
    expect(primeiro.getByText("ana1@x.com")).toBeInTheDocument();
    expect(primeiro.getByRole("button", { name: "Ver" })).toBeInTheDocument();
    expect(
      primeiro.getByRole("button", { name: "Revisar" }),
    ).toBeInTheDocument();

    const segundo = within(cards[1]);
    expect(segundo.getByRole("button", { name: "Ver" })).toBeInTheDocument();
    expect(segundo.queryByRole("button", { name: "Revisar" })).toBeNull();
  });
});
