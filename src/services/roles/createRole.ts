import { CreateRoleDto } from "../../dtos/roles/createRole";
import { UserRole } from "../../types/roles/UserRole";
import fetchWrapper from "../../utils/fetchWrapper";
import { role } from "../urls";


export async function createRole(newRole: CreateRoleDto, token: string) : Promise<UserRole[]>{
    const response = await fetchWrapper(`${role}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(newRole),
    });
    if (response.status !== 201) {
        throw new Error("Erro ao buscar usuários");
    } else {
        return await response.json() as UserRole[]
    }
}