import { SectionForm } from "@/types/partnerPrepForm/sectionForm";
import fetchWrapper from "@/utils/fetchWrapper";
import { Paginate } from "@/utils/paginate";
import { admin_section_form } from "../urls";

export async function getGlobalSections(
  token: string
): Promise<Paginate<SectionForm>> {
  const response = await fetchWrapper(admin_section_form, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error(`Erro ao buscar seções globais`);
  }

  return res;
}
