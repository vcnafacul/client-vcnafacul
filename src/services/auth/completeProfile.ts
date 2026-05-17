import { StatusCodes } from "http-status-codes";
import fetchWrapper from "../../utils/fetchWrapper";
import { decoderUser } from "../../utils/decodedUser";
import { completeProfileUrl } from "../urls";

const completeProfile = async (
  token: string,
  data: {
    phone: string;
    gender: number;
    birthday: string;
    state: string;
    city: string;
    lgpd: boolean;
  }
) => {
  // Token vem da URL (fluxo de onboarding), não do cookie — passa explicitamente no header
  const response = await fetchWrapper(completeProfileUrl, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const res = await response.json();
    if (response.status === StatusCodes.FORBIDDEN) {
      throw new Error("Perfil já completo ou não é um usuário Google");
    }
    throw new Error(res.message || "Erro ao completar perfil");
  }

  const res = await response.json();
  return decoderUser(res.access_token);
};

export default completeProfile;
