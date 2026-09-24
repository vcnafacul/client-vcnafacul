import { Role } from "../../types/roles/role";
import fetchWrapper from "../../utils/fetchWrapper";
import { Paginate } from "../../utils/paginate";
import { role } from "../urls";


/*
  ⚠️ **`limit` 1000, não 0.** O 0 era "sem limite" (o TypeORM ignora
  `take(0)`), mas desde o api#557 o `GetAllDtoInput` aceita de 1 a 1000 e a
  api responde 400 — a tela de usuários abria sem funções no filtro nem na
  troca. São só as funções da plataforma (sem cursinho): 1000 sobra.
*/
export async function getRoles(token: string, page:number = 1, limit:number = 1000) : Promise<Paginate<Role>>{
    const response = await fetchWrapper(`${role}?page=${page}&limit=${limit}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });

    if (response.status === 200) {
        const res = await response.json()
        return {
            data: [{ name: 'Todos', id: 0}, ...res.data],
            page: res.page,
            limit: res.limit,
            totalItems: res.totalItems
        }
    } else {
        throw new Error("Erro ao buscar roles");
    }
}