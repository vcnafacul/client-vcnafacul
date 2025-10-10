import { SectionForm } from "@/types/partnerPrepForm/sectionForm";
import fetchWrapper from "@/utils/fetchWrapper";
import { Paginate } from "@/utils/paginate";
import { section_form } from "../urls";

export async function getSection(
  token: string
): Promise<Paginate<SectionForm>> {
  const response = await fetchWrapper(section_form, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const res = await response.json();
  if (response.status !== 200) {
    throw new Error(`Erro ao buscar seções de formulários`);
  }

  return res;
}
