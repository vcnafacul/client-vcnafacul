import fetchWrapper from "../../utils/fetchWrapper";
import { questoes } from "../urls";

export async function uploadImage (data: FormData, token: string): Promise<string> {
    const response = await fetchWrapper(`${questoes}/uploadimage`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
    });
    if(response.status !== 201){
        throw new Error('Erro ao tentar fazer upload da imagem!')
    }
    return await response.text()
}
