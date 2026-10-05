import { studentCourse } from "@/services/urls";

/**
 * A mensagem do processo seletivo de teste, como a api a escreve — é o único
 * 400 que a tela mostra com o toast escuro de aviso, e não como erro.
 */
const MENSAGEM_PROCESSO_DE_TESTE = "processo seletivo marcado como teste";

/**
 * ⚠️ **A mensagem vem da api** (tickets/035). Antes, todo 400 virava
 * "Processo Seletivo de Teste" — inclusive turma encerrada e "o estudante já
 * possui matrícula ativa no cursinho X" —, e o 404 (não declarou interesse)
 * caía como sucesso: a tela dizia "Matrícula confirmada" sem ter matriculado.
 */
export async function confirmEnrolled(studentId: string, classId: string, token: string) {
  const response = await fetch(
    `${studentCourse}/confirm-enrolled/${studentId}/class/${classId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (response.ok) return;

  if (response.status === 400 || response.status === 404) {
    const corpo = await response.json().catch(() => null);
    const mensagem: string | undefined =
      typeof corpo?.message === "string" ? corpo.message : undefined;

    if (mensagem?.toLowerCase().includes(MENSAGEM_PROCESSO_DE_TESTE)) {
      const err = new Error("Processo Seletivo de Teste: Não é possível matricular estudantes");
      (err as Error & { isTestPS: boolean }).isTestPS = true;
      throw err;
    }
    throw new Error(mensagem ?? "Não foi possível confirmar a matrícula.");
  }

  throw new Error(`Ops, ocorreu um problema na requisição. Tente novamente!`);
}
