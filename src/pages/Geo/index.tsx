import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import { ReactComponent as TriangleYellow } from "../../assets/icons/triangle-yellow.svg";
import GeoForm from "../../components/organisms/geoForm";
import BaseTemplate from "../../components/templates/baseTemplate";
import { geoForm } from "./data";

function Geo(){
  return (
    <BaseTemplate solid className="bg-white overflow-y-auto scrollbar-hide h-screen ">
      <div className="relative">

        <TriangleGreen className="graphism triangle-green"/>
        <TriangleYellow className="graphism triangle-yellow"/>
        <GeoForm {...geoForm} />
      </div>
    </BaseTemplate>
  )
}

export default Geo
