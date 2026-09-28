import { PublicGeolocation } from "../../../types/geolocation/publicGeolocation";
import Text from "../../atoms/text";

import {
  FaEnvelopeSquare,
  FaFacebookSquare,
  FaInstagramSquare,
  FaLinkedin,
  FaMapMarkerAlt,
  FaTiktok,
  FaTwitterSquare,
  FaWhatsappSquare,
  FaYoutubeSquare,
} from "react-icons/fa";
import { MdOutlineTravelExplore } from "react-icons/md";
import BLink from "../../molecules/bLink";
import { TypeMarker } from "../../../types/map/marker";
import { MarkerPin } from "../../molecules/mapBox";

interface MapBoxInfoProps {
  geo?: PublicGeolocation;
  /** Sem link, sem o botão "Cadastrar um Cursinho" (a busca já tem o seu). */
  ctaLink?: string;
  label?: string;
  markerType?: TypeMarker;
}

/**
 * ⚠️ Campo vazio vem `null` da api. O teste antigo (`campo?.length !== 0`) é
 * VERDADEIRO para `null`, e mostrava ícone sem link — e o WhatsApp como
 * `phone=55null`. Link só com valor de verdade (achado no tickets/022, 02).
 */
const tem = (v: string | null | undefined): v is string => !!v?.trim();

function MapBoxInfoGeo({ geo, ctaLink, label, markerType }: MapBoxInfoProps) {
  return (
    <>
      <Text className="flex items-center justify-center gap-2">
        {markerType != null ? (
          <MarkerPin type={markerType} size={30} />
        ) : (
          <FaMapMarkerAlt color="red" size={30} />
        )}
        {label ?? "Localiza Cursinho"}
      </Text>
      <Text size="quaternary" className="m-0">
        {geo?.name}
      </Text>
      <Text size="quaternary" className="m-0">
        {geo?.street} - {geo?.number}, {geo?.complement}
      </Text>
      <Text size="quaternary" className="m-0">
        {" "}
        {geo?.neighborhood}, {geo?.cep}{" "}
      </Text>
      <Text size="quaternary" className="m-0">
        {" "}
        {geo?.city} - {geo?.state}{" "}
      </Text>
      <Text size="quaternary" className="m-0">
        {geo?.phone}
      </Text>
      <div className="flex justify-around mx-auto w-96">
        {tem(geo?.whatsapp) && (
          <a
            href={`https://api.whatsapp.com/send?phone=55${geo.whatsapp}`}
            target="_blank"
          >
            <FaWhatsappSquare color={"#707070"} size={40} />
          </a>
        )}
        {tem(geo?.email) && (
          <a href={`mailto:${geo.email}`}>
            <FaEnvelopeSquare color={"#707070"} size={40} />
          </a>
        )}
        {tem(geo?.site) && (
          <a href={geo.site} target="_blank" rel="noreferrer">
            <MdOutlineTravelExplore color={"#707070"} size={40} />
          </a>
        )}
        {tem(geo?.linkedin) && (
          <a href={geo.linkedin} target="_blank" rel="noreferrer">
            <FaLinkedin color={"#707070"} size={40} />
          </a>
        )}
        {tem(geo?.youtube) && (
          <a href={geo.youtube} target="_blank" rel="noreferrer">
            <FaYoutubeSquare color={"#707070"} size={40} />
          </a>
        )}
        {tem(geo?.facebook) && (
          <a href={geo.facebook} target="_blank" rel="noreferrer">
            <FaFacebookSquare color={"#707070"} size={40} />
          </a>
        )}
        {tem(geo?.instagram) && (
          <a href={geo.instagram} target="_blank" rel="noreferrer">
            <FaInstagramSquare color={"#707070"} size={40} />
          </a>
        )}
        {tem(geo?.twitter) && (
          <a href={geo.twitter} target="_blank" rel="noreferrer">
            <FaTwitterSquare color={"#707070"} size={40} />
          </a>
        )}
        {tem(geo?.tiktok) && (
          <a href={geo.tiktok} target="_blank" rel="noreferrer">
            <FaTiktok color={"#707070"} size={30} />
          </a>
        )}
      </div>
      {ctaLink && (
        <>
          <Text size="tertiary" className="m-0 mt-5">
            Conhece um cursinho popular?
          </Text>
          <div>
            <BLink className="min-w-[300px]" to={ctaLink}>
              Cadastrar um Cursinho
            </BLink>
          </div>
        </>
      )}
    </>
  );
}

export default MapBoxInfoGeo;
