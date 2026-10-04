import { describe, expect, it } from "vitest";
import type { CollaboratorColumns } from ".";
import { buscarColaboradores } from "./buscaDeColaboradores";

const pessoa = (
  name: string,
  email: string,
  funcao: string,
  phone = "",
): CollaboratorColumns =>
  ({
    id: name,
    name,
    email,
    phone,
    role: { id: "r", name: funcao },
  }) as unknown as CollaboratorColumns;

const LISTA = [
  pessoa("João Silva", "joao@x.com", "Professor", "11987654321"),
  pessoa("Ana Lima", "ana@x.com", "Coordenação", "21912345678"),
  pessoa("Bia Souza", "bia@x.com", "Professor"),
];
const nomes = (busca: string) =>
  buscarColaboradores(LISTA, busca).map((c) => c.name);

describe("buscarColaboradores (tickets-documentacao, 04)", () => {
  it("sem termo devolve todos", () => {
    expect(nomes("")).toHaveLength(3);
    expect(nomes("   ")).toHaveLength(3);
  });

  it("busca por nome, email ou função", () => {
    expect(nomes("ana")).toEqual(["Ana Lima"]);
    expect(nomes("bia@x")).toEqual(["Bia Souza"]);
    expect(nomes("professor")).toEqual(["João Silva", "Bia Souza"]);
  });

  it("ignora acento e maiúsculas, nos dois sentidos", () => {
    expect(nomes("joao")).toEqual(["João Silva"]);
    expect(nomes("JOÃO")).toEqual(["João Silva"]);
    expect(nomes("coordenacao")).toEqual(["Ana Lima"]);
  });

  it("telefone pelos dígitos, com ou sem máscara", () => {
    expect(nomes("98765")).toEqual(["João Silva"]);
    expect(nomes("(21) 91234")).toEqual(["Ana Lima"]);
  });

  it("poucos dígitos não procuram no telefone", () => {
    expect(nomes("11")).toEqual([]);
  });

  it("nada encontrado devolve vazio", () => {
    expect(nomes("ninguém")).toEqual([]);
  });
});
