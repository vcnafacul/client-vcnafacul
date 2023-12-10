import { decoderUser } from "../../utils/decodedUser";
import { login } from "../urls";

const Login = async (email: string, password: string) => {
    const data = { email, password };
    
    const response = await fetch(login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    const res = await response.json();
    if (response.status === 409) {
        throw new Error("A senha informada está incorreta!");
    } else if (response.status === 404) {
        throw new Error("Esse e-mail não foi cadastrado em nossa plataforma!");
    } else if (response.status === 422) {
        let errorField = "";
        switch (res["errors"][0]["field"]) {
            case "password":
                errorField = "senha";
                break;
            default:
                errorField = res["errors"][0]["field"];
        }
        throw new Error("Preencha corretamente o campo de " + errorField + " e tente novamente!");
    } else {
        return decoderUser(res.access_token)
    }
};

export default Login