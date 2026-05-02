import { StatusCodes } from "http-status-codes";
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
  const response = await fetch(completeProfileUrl, {
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
