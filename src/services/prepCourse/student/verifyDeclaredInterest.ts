import { declaredInterest } from "@/services/urls";

export async function verifyDeclaredInterest(idStudentCourse: string, token: string) {
  const response = await fetch(`${declaredInterest}/${idStudentCourse}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 200) {
    throw new Error(`Ops, ocorreu um problema na requisição. Tente novamente!`);
  }

  return await response.json();
}
