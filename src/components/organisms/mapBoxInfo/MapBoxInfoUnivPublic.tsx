import { University } from "../../../types/university/university";
import Text from "../../atoms/text";

import { FaMapMarkerAlt } from "react-icons/fa";

interface MapBoxInfoProps {
  univPublic: University;
}

function MapBoxInfoUnivPublic({ univPublic }: MapBoxInfoProps) {
  return (
    <>
      <Text className="flex items-center justify-center">
        <FaMapMarkerAlt color="red" size={30} /> Localiza Universidade
      </Text>
      <Text size="quaternary" className="m-0">
        {univPublic?.name} - {univPublic?.campus}
      </Text>
      <Text size="quaternary" className="m-0">
        {univPublic?.address}
      </Text>
      <Text size="quaternary" className="m-0">
        {univPublic?.neighborhood}, {univPublic?.cep}
      </Text>
      <Text size="quaternary" className="m-0">
        {univPublic?.city} - {univPublic?.state}
      </Text>
      <Text size="quaternary" className="m-0">
        {univPublic?.phone}
      </Text>
      {univPublic?.site && (
          <a href={univPublic?.site} target="_blank" rel="noreferrer">
            <Text size="quaternary" className="m-0">
              {univPublic?.site}
            </Text>
          </a>
        )}
    </>
  );
}

export default MapBoxInfoUnivPublic;
