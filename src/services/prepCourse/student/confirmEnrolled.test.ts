import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/urls", () => ({ studentCourse: "http://api/student-course" }));

const { confirmEnrolled } = await import("./confirmEnrolled");

const responder = (status: number, corpo?: unknown) =>
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      status,
      ok: status >= 200 && status < 300,
      json: async () => corpo,
    }),
  );

/** tickets/035, card 02. */
describe("confirmEnrolled", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("200 resolve", async () => {
    responder(200);
    await expect(confirmEnrolled("s1", "t1", "tok")).resolves.toBeUndefined();
  });

  it("⚠️ matrícula ativa em outro cursinho: o erro traz a mensagem da api", async () => {
    const message =
      'Não é possível matricular: o estudante já possui matrícula ativa no cursinho X, no período letivo "Extensivo" (2026), de 01/02/2026 a 30/11/2026.';
    responder(400, { statusCode: 400, message });

    const erro = await confirmEnrolled("s1", "t1", "tok").catch((e) => e);

    expect(erro.message).toBe(message);
    expect(erro.isTestPS).toBeUndefined();
  });

  it("processo seletivo de teste continua com o aviso próprio", async () => {
    responder(400, {
      message:
        "Não é possível matricular o estudante em um processo seletivo marcado como teste",
    });

    const erro = await confirmEnrolled("s1", "t1", "tok").catch((e) => e);

    expect(erro.isTestPS).toBe(true);
  });

  it("⚠️ 404 NÃO é sucesso", async () => {
    responder(404, {
      message: "Não é possível confirmar estudantes matriculados que não declarou interesse",
    });

    await expect(confirmEnrolled("s1", "t1", "tok")).rejects.toThrow(
      "não declarou interesse",
    );
  });

  it("400 sem corpo legível: mensagem genérica, nunca o aviso de teste", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 400,
        ok: false,
        json: async () => {
          throw new Error("não é json");
        },
      }),
    );

    const erro = await confirmEnrolled("s1", "t1", "tok").catch((e) => e);

    expect(erro.message).toBe("Não foi possível confirmar a matrícula.");
    expect(erro.isTestPS).toBeUndefined();
  });

  it("outros status viram erro, nunca sucesso", async () => {
    responder(403);
    await expect(confirmEnrolled("s1", "t1", "tok")).rejects.toThrow();
  });
});
