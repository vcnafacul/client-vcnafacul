// client-vcnafacul/src/pages/homeV2/adapters/prepCoursesAdapter.ts
import { getPartnerPrepCourseLogos } from "../../../services/prepCourse/partnerLogos";
import { supporters as supportersFallback } from "../../../pages/homeLegacy/data";

const VITE_VCNAFACUL_ID = import.meta.env.VITE_VCNAFACUL_ID;

export interface PrepCourse {
  logoUrl: string;
  alt: string;
  link: string;
  city?: string;
  name?: string;
}

export const prepCoursesFallback: PrepCourse[] = supportersFallback.prepCourse
  .filter((p) => typeof p.image === "string")
  .map((p) => ({
    logoUrl: p.image as string,
    alt: p.alt,
    link: p.link,
    name: p.alt.replace(/^logo-/, "").toUpperCase(),
  }));

export async function fetchPrepCourses(): Promise<PrepCourse[]> {
  try {
    const logos = await getPartnerPrepCourseLogos();
    const filtered = logos.filter(
      (item) =>
        item.logoUrl &&
        (!VITE_VCNAFACUL_ID || item.id !== String(VITE_VCNAFACUL_ID)),
    );
    if (filtered.length === 0) return prepCoursesFallback;
    return filtered.map((item) => ({
      logoUrl: item.logoUrl,
      alt: item.name || "Cursinho parceiro",
      link: item.siteUrl || "#",
      name: item.name,
    }));
  } catch {
    return prepCoursesFallback;
  }
}
