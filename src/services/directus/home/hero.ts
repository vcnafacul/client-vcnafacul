import { Slide } from "../../../components/organisms/hero";
import { hero } from "../../urls";

export async function getHeroSlides(): Promise<Slide[]> {
  const response = await fetch(hero, {
    method: "GET",
    headers: { "Content-Type": "application/json" }, 
  })
  return (await response.json()).data
}