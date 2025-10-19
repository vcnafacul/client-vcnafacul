import { CardDash } from "@/components/molecules/cardDash";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { ClassEntity } from "@/types/partnerPrepCourse/classEntity";
import { isCurrentDateBetween } from "./isCurrentDateBetween";

export const cardClassTransformation = (entity: ClassEntity): CardDash => {
  const status =
    new Date() < new Date(entity.startDate)
      ? StatusEnum.Pending
      : isCurrentDateBetween(entity.startDate, entity.endDate)
      ? StatusEnum.Approved
      : StatusEnum.Rejected;
  return {
    id: entity.id,
    title: entity.name,
    status: status,
    infos: [
      {
        field: "Inscritos",
        value: entity.number_students.toString(),
      },
    ],
  };
};
