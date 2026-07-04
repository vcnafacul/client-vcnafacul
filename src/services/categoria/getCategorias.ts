import { ICategoria } from "../../dtos/categoria/categoria";
import fetchWrapper from "../../utils/fetchWrapper";
import { Paginate } from "../../utils/paginate";
import { categoria } from "../urls";

export async function getCategorias(token: string): Promise<Paginate<ICategoria>> {
    const response = await fetchWrapper(`${categoria}?page=1&limit=0`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    if (response.status === 200) {
        return await response.json();
    }
    throw new Error(`${response.status} - Erro ao buscar categorias de simulado`);
}
