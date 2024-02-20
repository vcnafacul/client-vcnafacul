import { ActionProps } from "../../../components/organisms/actionAreas";
import { actions } from "../../urls";

export async function getActions(): Promise<ActionProps> {
  try {
    const response = await fetch(actions, {
      method: "GET",
      headers: { "Content-Type": "application/json" }, 
    })
    return (await response.json()).data
  } catch (error) {
    throw Error('Não foi possível recuperar seção Areas de Ação')
  }
}