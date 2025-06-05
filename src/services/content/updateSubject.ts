import { UpdateSubjectDto } from "../../dtos/content/SubjectDto";
import fetchWrapper from "../../utils/fetchWrapper";
import { subject } from "../urls";

export async function updateSubject(data: UpdateSubjectDto, token: string): Promise<void> {
    const response = await fetchWrapper(subject, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });
    if(response.status !== 200){
        if(response.status >= 400) {
            const res = await response.json()
            throw new Error(res)
        }
    }
}