import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import { ReactComponent as TriangleYellow } from "../../assets/icons/triangle-yellow.svg";
import GeoForm from "../../components/organisms/geoForm";
import BaseTemplate from "../../components/templates/baseTemplate";
import { useLocation } from "react-router-dom";
import { geoForm } from "./data";

function Geo() {
  // Vindo do "Não encontrei, cadastrar" (Localiza Cursinho, card 08).
  const nome = (useLocation().state as { name?: unknown } | null)?.name;
  const nomeInicial = typeof nome === "string" ? nome.slice(0, 255) : undefined;
  return (
    <BaseTemplate
      solid
      className="bg-white overflow-y-auto scrollbar-hide h-screen "
    >
      <div className="relative">
        <TriangleGreen className="graphism triangle-green" />
        <TriangleYellow className="graphism triangle-yellow" />
        <GeoForm formData={geoForm.formData} nomeInicial={nomeInicial} />
      </div>
    </BaseTemplate>
  );
}

export default Geo;
