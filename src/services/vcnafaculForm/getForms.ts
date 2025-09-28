import { vcnafaculFormGetForms } from "@/services/urls";
import { VcnafaculFormBaseSchema, VcnafaculFormSection } from "@/types/vcnafaculForm/vcnafaculForm";
import fetchWrapper from "@/utils/fetchWrapper";
import { Paginate } from "@/utils/paginate";

export interface VcnafaculForm extends VcnafaculFormBaseSchema {
    name: string;
    inscriptionId: string;
    sections: VcnafaculFormSection[];
    blocked: boolean;
    active: boolean;
}

export async function getForms(
    token: string,
    name?: string,
    page: number = 1,
    limit: number = 100,
): Promise<Paginate<VcnafaculForm>> {

    const url = new URL(vcnafaculFormGetForms);
    const params: Record<string, string | number> = { page, limit }
    if (name) params.name = name;
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key].toString()))

    const response = await fetchWrapper(url.toString(), {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
    const res = await response.json();
    if (response.status !== 200) {
        throw new Error(`Erro ao buscar formulários VCNAFACUL`);
    }

    return res;
}
