import fetchWrapper from "../../utils/fetchWrapper";
// import { defaults } from "../urls";

export async function getSimuladosDefaults(token: string) {
    const response = await fetchWrapper(`${'defaults'}/`,  {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    })
    const payload = await response.json()
    return payload
}