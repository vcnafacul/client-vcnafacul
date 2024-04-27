import { StatusCodes } from "http-status-codes";
import { confirmemail } from "../urls";
import { decoderUser } from "../../utils/decodedUser";

export const confirmEmail = async (token: string) => {
  const response = await fetch(confirmemail, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  switch (response.status) {
    case StatusCodes.OK:
      return decoderUser((await response.json()).access_token);
    case StatusCodes.NOT_FOUND:
      throw new Error("Usuário não foi localizado");
    case StatusCodes.CONFLICT:
      throw new Error("Email já validado");
    default:
      throw new Error("Erro interno no servidor!");
  }
};