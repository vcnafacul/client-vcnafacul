import { user_role } from "../urls";


export async function updateRole(userId: number, roleId: number, token: string) : Promise<boolean>{
    const response = await fetch(user_role, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({userId, roleId}),
    });

    if(response.status === 304 || response.status === 200) {
        return true
    }
    else {
        throw new Error("Erro ao tentar atualizar permissões");
    }
}