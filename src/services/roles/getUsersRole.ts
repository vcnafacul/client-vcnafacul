import { UserRole } from "../../types/roles/UserRole";
import fetchWrapper from "../../utils/fetchWrapper";
import { user_role } from "../urls";


export async function getUsersRole(token: string) : Promise<UserRole[]>{
    const response = await fetchWrapper(`${user_role}/user`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });

    if (response.status !== 200) {
        throw new Error("Erro ao buscar usuários");
    } else {
        return await response.json() as UserRole[]
    }
}