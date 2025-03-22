/* eslint-disable @typescript-eslint/no-explicit-any */
import { enrolled } from "@/services/urls";
import { GetEnrolledDtoOutput } from "@/types/partnerPrepCourse/StudentsEnrolled";
import { calculeAge } from "@/utils/calculateAge";
import fetchWrapper from "@/utils/fetchWrapper";
import { GridFilterItem, GridSortModel } from "@mui/x-data-grid";

const nothasActiveInscription = "No active inscription course";
const alreadyInscribed = "User already inscribed";

export async function getStudentsEnrolled(
  token: string,
  page: number,
  limit: number,
  filters?: GridFilterItem,
  sortModel?: GridSortModel
): Promise<GetEnrolledDtoOutput> {
  const url = new URL(enrolled);
  const params: Record<string, string | number> = {
    page,
    limit,
  };

  console.log(filters?.operator);

  if(filters){
    params["filter[field]"] = filters.field;
    params["filter[value]"] = filters.value;
    params["filter[operator]"] = filters.operator;
  }

  if (sortModel && sortModel.length > 0) {
    params["sort[field]"] = sortModel[0].field;
    params["sort[order]"] = sortModel[0].sort as string;
  }

  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key].toString())
  );
  const response = await fetchWrapper(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const res = await response.json();
  if (response.status !== 200) {
    switch (res.message) {
      case nothasActiveInscription:
        throw "Não há inscrição ativa para esse curso";
      case alreadyInscribed:
        throw "Usuário já realizou inscrição para esse curso";
      default:
        throw res;
    }
  }
  return {
    name: res.name,
    students: {
      data: res.students.data.map((student: any) => ({
        ...student,
        birthday: new Date(student.birthday),
        age: calculeAge(new Date(student.birthday)),
      })),
      page: res.students.page,
      limit: res.students.limit,
      totalItems: res.students.totalItems,
    },
  };
}
