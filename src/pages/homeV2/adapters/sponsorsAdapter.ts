import { getHomeSupporters } from "../../../services/home/getHomeSupporters";
import { homeContentFile } from "../../../services/urls";
import { supporters as supportersFallback } from "../../../pages/homeLegacy/data";

export interface Sponsor {
  logoUrl: string;
  alt: string;
  link: string;
  description?: string | null;
}

export const sponsorsFallback: Sponsor[] = supportersFallback.sponsors
  .filter((s) => typeof s.Patrocinador_id.image === "string")
  .map((s) => ({
    logoUrl: s.Patrocinador_id.image as string,
    alt: s.Patrocinador_id.alt,
    link: s.Patrocinador_id.link,
  }));

export async function fetchSponsors(): Promise<Sponsor[]> {
  const res = await getHomeSupporters();
  if (!res || res.length === 0) return sponsorsFallback;
  return res.map((s) => ({
    logoUrl: s.logoUrl
      ? /^https?:\/\//.test(s.logoUrl)
        ? s.logoUrl
        : homeContentFile(s.logoUrl)
      : "",
    alt: s.name,
    link: s.link,
    description: s.description ?? null,
  }));
}
