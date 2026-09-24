import { ICategoria } from "../../dtos/categoria/categoria";
import fetchWrapper from "../../utils/fetchWrapper";
import { Paginate } from "../../utils/paginate";
import { categoria } from "../urls";

/**
 * ⚠️ **`limit=500`, e não `0`.** O `0` era "sem limite" no ms, mas a api passou a
 * validar `limit` entre 1 e 1000 (api#557, 2026-09-20 — o `0` virava dump de
 * tabela) e esta chamada começou a receber 400. 500 é o teto do ms (ele corta
 * o que passar disso); categorias são poucas dezenas.
 */
export async function getCategorias(token: string): Promise<Paginate<ICategoria>> {
    const response = await fetchWrapper(`${categoria}?page=1&limit=500`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    if (response.status === 200) {
        return await response.json();
    }
    throw new Error(`${response.status} - Erro ao buscar categorias de simulado`);
}
