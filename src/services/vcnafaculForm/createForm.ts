import { vcnafaculForm } from "@/services/urls";
import { VcnafaculForm } from "@/types/vcnafaculForm/vcnafaculForm";
import fetchWrapper from "@/utils/fetchWrapper";

export interface CreateVcnafaculFormDto {
    name: string;
}

export async function createVcnafaculForm(
    data: CreateVcnafaculFormDto,
    token: string
): Promise<VcnafaculForm> {
    const response = await fetchWrapper(vcnafaculForm, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (response.status !== 201) {
        const res = await response.json();
        throw new Error(res.message || "Erro ao criar formulário VCNAFACUL");
    }

    return await response.json();
}
