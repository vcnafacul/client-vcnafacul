
import { UserRegister } from "../../types/user/userRegister";
import { decoderUser } from "../../utils/decodedUser";
import { userRoute } from "../urls";

export async function registerUser(data : UserRegister) {
    data.gender = parseInt(data.gender as unknown as string)
    const response = await fetch(userRoute, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    const res = await response.json();
    if(response.status === 201){
        return decoderUser(res.access_token)
    }
    throw new Error(`Ops, ocorreu um problema na requisição. Tente novamente!. Message ${res}`);
}