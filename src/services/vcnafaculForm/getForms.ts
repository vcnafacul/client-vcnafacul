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
    page: number = 1,
    limit: number = 100,
): Promise<Paginate<VcnafaculForm>> {
    const response = await fetchWrapper(vcnafaculFormGetForms + `?page=${page}&limit=${limit}`, {
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
