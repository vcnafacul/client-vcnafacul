
import { AboutUsProps } from "../../../components/organisms/aboutUs";
import { about_us } from "../../urls";

export async function getAboutUs(): Promise<AboutUsProps> {
  try {
    const response = await fetch(about_us, {
      method: "GET",
      headers: { "Content-Type": "application/json" }, 
    })
    return (await response.json()).data
  } catch (error) {
    throw Error('Não foi possível recuperar seção Quem Somos')
  }
}