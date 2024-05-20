import { Geolocation } from "../../../types/geolocation/geolocation";
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

interface MapBoxInfoProps {
  boxRef: React.RefObject<HTMLDivElement>;
  geo: Geolocation;
  ctaLink: string;
}

function MapBoxInfo({ boxRef, geo, ctaLink }: MapBoxInfoProps) {
  return (
    <div
      ref={boxRef}
      className="md:w-[600px] h-fit relative mb-10 mx-auto md:absolute z-40 
        top-5 md:right-10 bg-white opacity-75 rounded-md p-5 flex items-center 
        justify-between flex-col"
    >
      <Text className="flex items-center justify-center">
        <FaMapMarkerAlt color="red" size={30} /> Localiza Cursinho
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
        {geo?.whatsapp.length !== 0 && (
          <a
            href={`https://api.whatsapp.com/send?phone=55${geo?.whatsapp}`}
            target="_blank"
          >
            <FaWhatsappSquare color={"#707070"} size={40} />
          </a>
        )}
        {geo?.email.length !== 0 && (
          <a href={`mailto:${geo?.email}`}>
            <FaEnvelopeSquare color={"#707070"} size={40} />
          </a>
        )}
        {geo?.site.length !== 0 && (
          <a href={geo?.site} target="_blank" rel="noreferrer">
            <MdOutlineTravelExplore color={"#707070"} size={40} />
          </a>
        )}
        {geo?.linkedin.length !== 0 && (
          <a href={geo?.linkedin} target="_blank" rel="noreferrer">
            <FaLinkedin color={"#707070"} size={40} />
          </a>
        )}
        {geo?.youtube.length !== 0 && (
          <a href={geo?.youtube} target="_blank" rel="noreferrer">
            <FaYoutubeSquare color={"#707070"} size={40} />
          </a>
        )}
        {geo?.facebook.length !== 0 && (
          <a href={geo?.facebook} target="_blank" rel="noreferrer">
            <FaFacebookSquare color={"#707070"} size={40} />
          </a>
        )}
        {geo?.instagram.length !== 0 && (
          <a href={geo?.instagram} target="_blank" rel="noreferrer">
            <FaInstagramSquare color={"#707070"} size={40} />
          </a>
        )}
        {geo?.twitter.length !== 0 && (
          <a href={geo?.twitter} target="_blank" rel="noreferrer">
            <FaTwitterSquare color={"#707070"} size={40} />
          </a>
        )}
        {geo?.tiktok.length !== 0 && (
          <a href={geo?.tiktok} target="_blank" rel="noreferrer">
            <FaTiktok color={"#707070"} size={30} />
          </a>
        )}
      </div>
      <Text size="tertiary" className="m-0 mt-5">
        Conhece um cursinho popular?
      </Text>
      <div>
        <BLink className="min-w-[300px]"  to={ctaLink}>Cadastrar um Cursinho</BLink>
      </div>
    </div>
  );
}

export default MapBoxInfo;
