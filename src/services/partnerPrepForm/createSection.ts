import { SectionForm } from "@/types/partnerPrepForm/sectionForm";
import fetchWrapper from "../../utils/fetchWrapper";
import { section_form } from "../urls";

export interface CreateSectionDtoInput {
  name: string;
}

export async function createSection(
  data: CreateSectionDtoInput,
  token: string
): Promise<SectionForm> {
  const response = await fetchWrapper(section_form, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const res = await response.json();
  if (response.status !== 201) {
    if (response.status >= 400) {
      throw res;
    }
  }
  return res;
}
