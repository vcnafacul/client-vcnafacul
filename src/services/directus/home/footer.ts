import { FooterProps } from "../../../components/organisms/footer";
import { footer } from "../../urls";

export async function getFooter(): Promise<FooterProps> {
  try {
    const response = await fetch(footer, {
      method: "GET",
      headers: { "Content-Type": "application/json" }, 
    })
    return (await response.json()).data
  } catch (error) {
    throw Error('Não foi possível recuperar seção Footer')
  }
}