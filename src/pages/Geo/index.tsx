import BaseTemplate from "../../components/templates/baseTemplate"
import { ReactComponent as TriangleGreen } from "../../assets/icons/triangle-green.svg";
import GeoForm from "../../components/organisms/geoForm";
import { geoForm } from "./data";

function Geo(){
  return (
    <BaseTemplate  solid className="bg-white overflow-y-auto scrollbar-hide relative">
      <div className="w-full flex justify-center">

        <TriangleGreen className="absolute -rotate-45 -left-28 -top-6 w-80"/>
        <GeoForm {...geoForm} />
      </div>
    </BaseTemplate>
  )
}

export default Geo