import { University } from "../../../types/university/university";
import { university } from "../../urls";

export async function getUniversities(): Promise<University[]> {
  try {
    const response = await fetch(university, {
      method: "GET",
      headers: { "Content-Type": "application/json" }, 
    })
    return (await response.json()).data
  } catch (error) {
    throw Error('Não foi possível recuperar seção Areas de Ação')
  }
}