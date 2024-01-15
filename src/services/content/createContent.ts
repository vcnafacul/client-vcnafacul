import { ContentDtoInput } from "../../dtos/content/contentDtoInput";
import { CreateContentDto } from "../../dtos/content/createContentDto";
import fetchWrapper from "../../utils/fetchWrapper";
import { content } from "../urls";

export async function createContent(data: CreateContentDto, token: string): Promise<ContentDtoInput> {
    const body: CreateContentDto = {
        title: data.title,
        description: data.description,
        subjectId: parseInt(data.subjectId as unknown as string)
    }
    const response = await fetchWrapper(content, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
    });
    const res = await response.json()
    if(response.status !== 201){
        if(response.status >= 400) {
            throw res
        }
    }
    return res
}