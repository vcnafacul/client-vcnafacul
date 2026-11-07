import Step5Geo from "@/components/organisms/geoForm/steps/step5";
import { geoForm } from "@/pages/Geo/data";
import { CreateGeolocation } from "@/types/geolocation/geolocation";
import { Vitrine } from "../tipos";

/**
 * Etapa "Canais digitais" do cadastro público do cursinho: cada rede só aceita
 * link do próprio domínio. Para ver os erros, clicar em Continuar.
 */
const errado = {
  site: "cursinho",
  instagram: "@cursinhosemear",
  youtube: "https://vimeo.com/cursinhosemear",
  facebook: "https://instagram.com/cursinhosemear",
  linkedin: "cursinho semear",
  twitter: "https://fox.com/cursinhosemear",
  tiktok: "tiktok/cursinhosemear",
} as unknown as CreateGeolocation;

const etapa = (dataGeo: CreateGeolocation) => (
  <Step5Geo
    {...geoForm.formData.step5}
    updateData={() => {}}
    handleBack={() => {}}
    dataGeo={dataGeo}
  />
);

export const vitrineCanaisDigitais: Vitrine = {
  slug: "canais-digitais",
  titulo: "Cadastro do cursinho — canais digitais",
  arquivo: "src/components/organisms/geoForm/steps/step5.tsx",
  estados: [
    {
      slug: "vazio",
      titulo: "Vazio",
      render: () => etapa({} as CreateGeolocation),
    },
    {
      slug: "links-errados",
      titulo: "Links errados",
      render: () => etapa(errado),
    },
  ],
};
