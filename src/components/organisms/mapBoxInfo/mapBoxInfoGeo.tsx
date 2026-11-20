import { PublicGeolocation } from "../../../types/geolocation/publicGeolocation";
import Text from "../../atoms/text";

import { Compass, Mail, MapPin } from "lucide-react";
import { ReactComponent as SocialFacebook } from "@/assets/icons/social-facebook.svg";
import { ReactComponent as SocialInstagram } from "@/assets/icons/social-instagram.svg";
import { ReactComponent as SocialLinkedin } from "@/assets/icons/social-linkedin.svg";
import { ReactComponent as SocialTiktok } from "@/assets/icons/social-tiktok.svg";
import { ReactComponent as SocialWhatsapp } from "@/assets/icons/social-whatsapp.svg";
import { ReactComponent as SocialX } from "@/assets/icons/social-x.svg";
import { ReactComponent as SocialYoutube } from "@/assets/icons/social-youtube.svg";
import BLink from "../../molecules/bLink";
import { TypeMarker } from "../../../types/map/marker";
import { MarkerPin } from "../../molecules/mapBox";
import { palette } from "@/lib/palette";

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
          <MapPin color="red" size={30} />
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
            <SocialWhatsapp color={palette.neutral[500]} className="h-10 w-10" />
          </a>
        )}
        {tem(geo?.email) && (
          <a href={`mailto:${geo.email}`}>
            <Mail color={palette.neutral[500]} size={40} />
          </a>
        )}
        {tem(geo?.site) && (
          <a href={geo.site} target="_blank" rel="noreferrer">
            <Compass color={palette.neutral[500]} size={40} />
          </a>
        )}
        {tem(geo?.linkedin) && (
          <a href={geo.linkedin} target="_blank" rel="noreferrer">
            <SocialLinkedin color={palette.neutral[500]} className="h-10 w-10" />
          </a>
        )}
        {tem(geo?.youtube) && (
          <a href={geo.youtube} target="_blank" rel="noreferrer">
            <SocialYoutube color={palette.neutral[500]} className="h-10 w-10" />
          </a>
        )}
        {tem(geo?.facebook) && (
          <a href={geo.facebook} target="_blank" rel="noreferrer">
            <SocialFacebook color={palette.neutral[500]} className="h-10 w-10" />
          </a>
        )}
        {tem(geo?.instagram) && (
          <a href={geo.instagram} target="_blank" rel="noreferrer">
            <SocialInstagram color={palette.neutral[500]} className="h-10 w-10" />
          </a>
        )}
        {tem(geo?.twitter) && (
          <a href={geo.twitter} target="_blank" rel="noreferrer">
            <SocialX color={palette.neutral[500]} className="h-10 w-10" />
          </a>
        )}
        {tem(geo?.tiktok) && (
          <a href={geo.tiktok} target="_blank" rel="noreferrer">
            <SocialTiktok color={palette.neutral[500]} className="h-8 w-8" />
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
