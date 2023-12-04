import { defaults } from "../urls";

export async function getSimuladosDefaults(token: string) {
    try {
        const response = await fetch(`${defaults}/`,  {
            method: "GET",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        })
        const payload = await response.json()
        return payload
    } catch (error) {
        console.error(error)
        throw error
    }
}