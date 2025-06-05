import { studentCourse } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

export async function sendEmailDeclarationInterest(
  id: string,
  token: string
): Promise<void> {
  const response = await fetchWrapper(
    `${studentCourse}/${id}/declared-interest`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (response.status !== 200) {
    if (response.status === 500) {
      throw "Provavel falha ao enviar email";
    }
    const res = await response.json();
    throw new Error(res.message);
  }
}
