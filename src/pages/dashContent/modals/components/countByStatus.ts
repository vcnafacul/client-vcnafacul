import { SubjectDto } from "@/dtos/content/contentDtoInput";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { StatusContent } from "@/enums/content/statusContent";

export function countByStatus(
  contents: SubjectDto["contents"],
  status: StatusEnum | StatusContent,
) {
  return contents.filter((c) => c.status === status).length;
}
