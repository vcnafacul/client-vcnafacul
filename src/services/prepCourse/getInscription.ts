import { StatusEnum } from "@/enums/generic/statusEnum";
import fetchWrapper from "../../utils/fetchWrapper";
import { inscriptionCourse } from "../urls";

interface HasActiveInscriptionResponse {
  prepCourseId: string;
  prepCourseName: string;
  prepCourseEmail: string;
  inscription: {
    name: string;
    email: string;
    description: string;
    startDate: Date;
    endDate: Date;
    status: StatusEnum;
  };
}

export async function getInscription(
  inscritionId: string,
  token: string
): Promise<HasActiveInscriptionResponse> {
  const response = await fetchWrapper(
    `${inscriptionCourse}/to-inscription/${inscritionId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const res = await response.json();
  if (response.status !== 200) {
    if (response.status >= 400) {
      throw res;
    }
    throw new Error("An error occurred");
  }
  return res as HasActiveInscriptionResponse;
}
