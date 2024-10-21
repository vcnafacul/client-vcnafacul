import { InscriptionOutput } from "@/pages/partnerPrepInscriptionManager/modals/InscriptionInfoEditModal";
import { inscriptionCourse } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function updateInscription(
  token: string,
  inscription: InscriptionOutput
): Promise<void> {
  console.log(inscription);
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
    throw new Error("Erro ao tentar atualizar inscrição");
  }
}
