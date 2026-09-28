import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Step1Geo from "./step1";
import { geoForm } from "../../../../pages/Geo/data";
import { CreateGeolocation } from "../../../../types/geolocation/geolocation";

const montar = () => {
  const updateData = vi.fn();
  const handleBack = vi.fn();
  const { container } = render(
    <Step1Geo
      {...geoForm.formData.step1}
      updateData={updateData}
      handleBack={handleBack}
      dataGeo={{} as CreateGeolocation}
    />,
  );
  const campo = (name: string) =>
    container.querySelector(`[name="${name}"]`) as HTMLInputElement;
  return { updateData, handleBack, campo };
};

describe("Step1Geo — Dados Pessoais, agora a última etapa (card 11)", () => {
  it("é quem envia: o botão é 'Enviar Cadastro'", async () => {
    const { updateData, campo } = montar();
    fireEvent.change(campo("userFullName"), { target: { value: "Ana" } });
    fireEvent.change(campo("userEmail"), { target: { value: "ana@x.com" } });
    fireEvent.change(campo("userPhone"), { target: { value: "11999" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar Cadastro" }));
    await waitFor(() => expect(updateData).toHaveBeenCalledTimes(1));
    expect(updateData.mock.calls[0][0]).toMatchObject({
      userFullName: "Ana",
      userEmail: "ana@x.com",
    });
  });

  it("Voltar não valida e leva o que já foi digitado", () => {
    const { updateData, handleBack, campo } = montar();
    fireEvent.change(campo("userFullName"), { target: { value: "Ana" } });
    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(handleBack).toHaveBeenCalledWith(
      expect.objectContaining({ userFullName: "Ana" }),
    );
    expect(updateData).not.toHaveBeenCalled();
  });
});
