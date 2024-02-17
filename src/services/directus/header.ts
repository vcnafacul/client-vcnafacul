import { HeaderData } from "../../components/organisms/header";
import { header } from "../urls";

export async function getHeader({ id = 1 }: {id: number}): Promise<HeaderData> {
  try {
    const response = await fetch(header(id), {
      method: "GET",
      headers: { "Content-Type": "application/json" }, 
    })
    return (await response.json()).data
  } catch (error) {
    throw Error('Não foi possível recuperar seção Novas Funcionalidades')
  }
}