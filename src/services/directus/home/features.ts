import { FeaturesProps } from "../../../components/organisms/features";
import { features } from "../../urls";

export async function getFeature(): Promise<FeaturesProps> {
  try {
    const response = await fetch(features, {
      method: "GET",
      headers: { "Content-Type": "application/json" }, 
    })
    return (await response.json()).data
  } catch (error) {
    throw Error('Não foi possível recuperar seção Novas Funcionalidades')
  }
}