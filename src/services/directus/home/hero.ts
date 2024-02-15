import { Slide } from "../../../components/organisms/hero";
import { hero } from "../../urls";

export async function getHeroSlides(): Promise<Slide[]> {
  try {
    const response = await fetch(hero, {
      method: "GET",
      headers: { "Content-Type": "application/json" }, 
    })
    return (await response.json()).data
  } catch (error) {
    throw Error('Não foi possível recuperar conteúdo Hero')
  }
}