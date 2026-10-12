import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../../../components/molecules/mapBox", () => ({ default: () => null }));
vi.mock("../../../../services/geolocation/getGeolocation", () => ({
  default: () => Promise.resolve([]),
}));
vi.mock("@/components/organisms/mapFilterCard", () => ({ MapFilterCard: () => null }));
vi.mock("@/components/organisms/mapInfoCard", () => ({ MapInfoCard: () => null }));

import { MapSection } from ".";

describe("MapSection", () => {
  it("o selo 'Localiza Cursinho' leva à página do Localiza", () => {
    render(
      <MemoryRouter>
        <MapSection id="map" data={null} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Localiza Cursinho" })).toHaveAttribute(
      "href",
      "/localiza-cursinho",
    );
  });
});
