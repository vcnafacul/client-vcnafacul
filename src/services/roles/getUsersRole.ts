import { UserRole } from "../../types/roles/UserRole";
import fetchWrapper from "../../utils/fetchWrapper";
import { Paginate } from "../../utils/paginate";
import { user_role } from "../urls";


export async function getUsersRole(token: string, page: number = 1, limit: number = 40) : Promise<Paginate<UserRole>>{
    const response = await fetchWrapper(`${user_role}/user?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });

    if (response.status !== 200) {
        throw new Error("Erro ao buscar usuários");
    } else {
        return await response.json()
    }
}