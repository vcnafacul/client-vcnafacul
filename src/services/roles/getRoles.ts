import { Role } from "../../types/roles/role";
import fetchWrapper from "../../utils/fetchWrapper";
import { Paginate } from "../../utils/paginate";
import { role } from "../urls";


export async function getRoles(token: string, page:number = 1, limit:number = 0) : Promise<Paginate<Role>>{
    const response = await fetchWrapper(`${role}?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });

    if (response.status === 200) {
        const res = await response.json()
        return {
            data: [{ name: 'Todos', id: 0}, ...res.data],
            page: res.page,
            limit: res.page,
            totalItems: res.totalItems
        }
    } else {
        throw new Error("Erro ao buscar roles");
    }
}