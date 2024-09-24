import { studentCourse } from "@/services/urls";
import { UserRegister } from "@/types/user/userRegister";

export async function registerUserFlowStudent(
  data: UserRegister,
  hashPrepCourse: string
) {
  data.gender = parseInt(data.gender as unknown as string);
  const response = await fetch(`${studentCourse}/user/${hashPrepCourse}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (response.status !== 201) {
    throw new Error(`Ops, ocorreu um problema na requisição. Tente novamente!`);
  }
}
