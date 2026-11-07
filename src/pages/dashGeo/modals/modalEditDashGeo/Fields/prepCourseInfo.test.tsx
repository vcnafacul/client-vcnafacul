import { prepCourseInfo } from "@/pages/dashGeo/data";
import { Geolocation } from "@/types/geolocation/geolocation";
import { TypeMarker } from "@/types/map/marker";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { toast } from "react-toastify";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PrepCourseInfo } from "./prepCourseInfo";

vi.mock("react-toastify", () => ({
  toast: { info: vi.fn(), error: vi.fn() },
}));

const geo = {
  id: "1",
  name: "Cursinho A",
  type: TypeMarker.geo,
  email: "contato@cursinho.org",
  site: "www.cursinho.org",
  instagram: "@cursinho",
  tiktok: "",
} as unknown as Geolocation;

const writeText = vi.fn();

function renderInfo(edit: boolean) {
  return render(
    <PrepCourseInfo
      form={prepCourseInfo}
      setValue={vi.fn()}
      errors={{}}
      edit={edit}
      geo={geo}
    />,
  );
}

describe("PrepCourseInfo — copiar contatos", () => {
  beforeEach(() => {
    writeText.mockReset().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    vi.mocked(toast.info).mockReset();
  });

  it("na visualização, mostra copiar só nos contatos preenchidos", () => {
    renderInfo(false);
    expect(
      screen.getByRole("button", { name: "Copiar Site" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copiar Email" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Copiar Tiktok" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Copiar Nome/ })).toBeNull();
  });

  it("copia o valor e avisa", async () => {
    renderInfo(false);
    fireEvent.click(screen.getByRole("button", { name: "Copiar Instagram" }));
    expect(writeText).toHaveBeenCalledWith("@cursinho");
    await waitFor(() =>
      expect(toast.info).toHaveBeenCalledWith("Instagram copiado!"),
    );
  });

  it("na edição, não mostra copiar", () => {
    renderInfo(true);
    expect(screen.queryByRole("button", { name: /Copiar/ })).toBeNull();
  });

  it("mostra o campo do TikTok", () => {
    renderInfo(false);
    expect(screen.getByLabelText("Tiktok")).toBeInTheDocument();
  });
});
