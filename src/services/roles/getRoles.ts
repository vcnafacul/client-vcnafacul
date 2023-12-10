import { Role } from "../../types/roles/role";
import fetchWrapper from "../../utils/fetchWrapper";
import { role } from "../urls";


export async function getRoles(token: string) : Promise<Role[]>{
    const response = await fetchWrapper(role, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });

    if (response.status === 200) {
        const res = [{ name: 'Todos', id: 0}, ...await response.json()]
        return res
    } else {
        throw new Error("Erro ao buscar roles");
    }
}