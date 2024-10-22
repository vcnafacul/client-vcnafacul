import { InscriptionOutput } from "@/pages/partnerPrepInscriptionManager/modals/InscriptionInfoCreateEditModal";
import { inscriptionCourse } from "@/services/urls";
import { Inscription } from "@/types/partnerPrepCourse/inscription";
import fetchWrapper from "@/utils/fetchWrapper";

export async function createInscription(
  token: string,
  inscription: InscriptionOutput
): Promise<Inscription> {
  const response = await fetchWrapper(inscriptionCourse, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: inscription.name,
      description: inscription.description,
      startDate: inscription.range[0],
      endDate: inscription.range[1],
      expectedOpening: inscription.openingsCount,
    }),
  });
  if (response.status === 400) {
    const res = await response.json();
    throw new Error(res.message);
  }
  if (response.status !== 201) {
    throw new Error("Erro ao tentar criar inscrição");
  }
  return await response.json();
}
