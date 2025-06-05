import { VerifyDeclaredInscriptionDto } from "@/dtos/inscription/verifyDeclaredInscriptionDto";
import { declaredInterest } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function verifyDeclaredInterest(inscriptionId: string, token: string) : Promise<VerifyDeclaredInscriptionDto> {
  const response = await fetchWrapper(`${declaredInterest}/${inscriptionId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 500) {
    throw new Error(`"Não foi possível carregar as informações de inscrição. 
      Por favor, tente novamente mais tarde ou entre em contato com nossa equipe de suporte ou com o cursinho."
`);
  }
  if([400, 404].includes(response.status)) {
    const res = await response.json();
    throw new Error(res.message);
  }

  return await response.json();
}
