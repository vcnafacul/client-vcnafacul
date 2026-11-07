import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Step5Geo from "./step5";
import { geoForm } from "../../../../pages/Geo/data";
import { CreateGeolocation } from "../../../../types/geolocation/geolocation";

const montar = () => {
  const updateData = vi.fn();
  const { container } = render(
    <Step5Geo
      {...geoForm.formData.step5}
      updateData={updateData}
      handleBack={vi.fn()}
      dataGeo={{} as CreateGeolocation}
    />,
  );
  const campo = (name: string) =>
    container.querySelector(`[name="${name}"]`) as HTMLInputElement;
  return { updateData, campo };
};

describe("Step5Geo — canais digitais", () => {
  it("link de outra rede no campo do Instagram não deixa continuar", async () => {
    const { updateData, campo } = montar();
    fireEvent.change(campo("instagram"), {
      target: { value: "https://facebook.com/cursinho" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(
      await screen.findByText(/Cole o link do Instagram/),
    ).toBeInTheDocument();
    expect(updateData).not.toHaveBeenCalled();
  });

  it("links certos seguem, com https:// completado", async () => {
    const { updateData, campo } = montar();
    fireEvent.change(campo("instagram"), {
      target: { value: "instagram.com/cursinho" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    await waitFor(() => expect(updateData).toHaveBeenCalledTimes(1));
    expect(updateData.mock.calls[0][0]).toMatchObject({
      instagram: "https://instagram.com/cursinho",
    });
  });
});
