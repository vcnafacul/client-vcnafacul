import { CreateSubjectDtoInput, CreateSubjectDtoOutput } from "../../dtos/content/SubjectDto";
import fetchWrapper from "../../utils/fetchWrapper";
import { subject } from "../urls";

export async function createSubject(data: CreateSubjectDtoOutput, token: string): Promise<CreateSubjectDtoInput> {
    const response = await fetchWrapper(subject, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    const res = await response.json()
    if(response.status !== 201){
        if(response.status === 400) {
            throw new Error(res)
        }
    }
    return res
}