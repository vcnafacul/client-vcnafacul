import { partnerPrepCourseLogos } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export interface PartnerPrepCourseLogo {
  id: string;
  name: string;
  logoUrl: string;
  siteUrl?: string;
}

export async function getPartnerPrepCourseLogos(): Promise<
  PartnerPrepCourseLogo[]
> {
  const response = await fetchWrapper(partnerPrepCourseLogos, {
    method: "GET",
  });

  if (!response || response.status !== 200) {
    try {
      const res = await response.json();
      throw new Error(res?.message || "Erro ao buscar logos de cursinhos parceiros");
    } catch {
      throw new Error("Erro ao buscar logos de cursinhos parceiros");
    }
  }

  return response.json();
}

