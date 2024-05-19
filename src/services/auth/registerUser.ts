import { UserRegister } from "../../types/user/userRegister";
import { user } from "../urls";

export async function registerUser(data: UserRegister) {
  data.gender = parseInt(data.gender as unknown as string);
  const response = await fetch(user, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (response.status !== 201) {
    throw new Error(
      `Ops, ocorreu um problema na requisição. Tente novamente!`
    );
  }
}
