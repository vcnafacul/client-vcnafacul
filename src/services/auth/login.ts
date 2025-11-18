import { StatusCodes } from "http-status-codes";
import { decoderUser } from "../../utils/decodedUser";
import { login } from "../urls";

const Login = async (email: string, password: string) => {
  const data = { email, password };

  const response = await fetch(login, {
    method: "POST",
    credentials: "include", // ✅ Envia/recebe cookies automaticamente
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (response.status === StatusCodes.UNAUTHORIZED) {
    throw new Error(
      "Email não autorizado - Caso já tenha efetuado o cadastro, verifique seu email para confirmação"
    );
  }
  const res = await response.json();
  if (response.status === StatusCodes.CONFLICT) {
    throw new Error("A senha informada está incorreta!");
  } else if (response.status === StatusCodes.NOT_FOUND) {
    throw new Error("Esse e-mail não foi cadastrado em nossa plataforma!");
  } else if (response.status === StatusCodes.UNPROCESSABLE_ENTITY) {
    let errorField = "";
    switch (res["errors"][0]["field"]) {
      case "password":
        errorField = "senha";
        break;
      default:
        errorField = res["errors"][0]["field"];
    }
    throw new Error(
      "Preencha corretamente o campo de " + errorField + " e tente novamente!"
    );
  } else {
    // Decodifica o access_token (refresh_token agora está no cookie)
    return decoderUser(res.access_token);
  }
};

export default Login;
