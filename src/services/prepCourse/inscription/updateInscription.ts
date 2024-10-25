import { InscriptionOutput } from "@/pages/partnerPrepInscriptionManager/modals/InscriptionInfoCreateEditModal";
import { inscriptionCourse } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function updateInscription(
  token: string,
  inscription: InscriptionOutput
): Promise<void> {
  const response = await fetchWrapper(inscriptionCourse, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id: inscription.id,
      name: inscription.name,
      description: inscription.description,
      startDate: inscription.range[0],
      endDate: inscription.range[1],
      expectedOpening: inscription.openingsCount,
    }),
  });
  if (response.status !== 200) {
    const res = await response.json();
    throw new Error(res.message);
  }
}
