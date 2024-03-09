
import { SupportersSponsor } from "../../../components/organisms/supporters";
import { sponsors } from "../../urls";

export async function getSponsor(): Promise<SupportersSponsor> {
  try {
    const response = await fetch(sponsors, {
      method: "GET",
      headers: { "Content-Type": "application/json" }, 
    })
    return (await response.json()).data
  } catch (error) {
    throw Error('Não foi possível recuperar seção Patrocinadores')
  }
}