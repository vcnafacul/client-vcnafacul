import { describe, expect, it } from "vitest";
import {
  ABA_PADRAO,
  abaDaUrl,
  caminhoDaTurma,
  PARAM_DA_ABA,
} from "./abaDaTurma";

describe("abaDaUrl", () => {
  it("lê a aba pedida", () => {
    expect(abaDaUrl(`?${PARAM_DA_ABA}=desempenho`)).toBe("desempenho");
    expect(abaDaUrl(`?${PARAM_DA_ABA}=simulados`)).toBe("simulados");
  });

  it("sem parâmetro, abre na aba padrão", () => {
    expect(abaDaUrl("")).toBe(ABA_PADRAO);
  });

  it("⚠️ valor desconhecido cai no padrão, e não numa tela em branco", () => {
    /*
      O Radix aceita qualquer string em `value` e renderiza vazio quando nenhum
      `TabsContent` casa. Um link velho com `?aba=notas` levaria a pessoa a uma
      página em branco, sem erro nenhum.
    */
    expect(abaDaUrl(`?${PARAM_DA_ABA}=notas`)).toBe(ABA_PADRAO);
  });

  it("convive com outros parâmetros na query", () => {
    expect(abaDaUrl(`?x=1&${PARAM_DA_ABA}=desempenho&y=2`)).toBe("desempenho");
  });
});

describe("caminhoDaTurma", () => {
  it("aponta para a aba pedida", () => {
    expect(caminhoDaTurma("/dashboard/turma", "t-1", "desempenho")).toBe(
      "/dashboard/turma/t-1?aba=desempenho",
    );
  });

  it("⚠️ a aba padrão NÃO entra na URL", () => {
    // `?aba=alunos` é ruído num link que a pessoa copia, e o `abaDaUrl` já
    // devolve `alunos` na ausência do parâmetro.
    expect(caminhoDaTurma("/dashboard/turma", "t-1")).toBe(
      "/dashboard/turma/t-1",
    );
  });
});
