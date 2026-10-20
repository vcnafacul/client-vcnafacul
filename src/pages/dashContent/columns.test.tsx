import { describe, expect, it } from "vitest";
import type { ContentDtoInput } from "@/dtos/content/contentDtoInput";
import { colunasDeConteudo, VAZIO } from "./columns";

const coluna = (id: string) => colunasDeConteudo.find((c) => c.id === id)!;

describe("colunas de conteúdo — Enviado por (048/07)", () => {
  it("mostra o nome de quem enviou o arquivo vigente", () => {
    const c = { uploadedByName: "Ana Souza" } as ContentDtoInput;
    expect(coluna("enviadoPor").cell(c)).toBe("Ana Souza");
    expect(coluna("enviadoPor").sortValue!(c)).toBe("Ana Souza");
  });

  it("sem arquivo mostra o travessão e ordena como nulo", () => {
    const c = {} as ContentDtoInput;
    expect(coluna("enviadoPor").cell(c)).toBe(VAZIO);
    expect(coluna("enviadoPor").sortValue!(c)).toBeNull();
  });
});
