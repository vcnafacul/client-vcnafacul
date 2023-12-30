export enum Materias {
    LPT,
    Gramatica,
    Literatura,
    Ingles,
    Espanhol,
    Biologia,
    Fisica,
    Quimica,
    Matematica,
    Historia,
    Geografia,
    Filosofia,
    Sociologia,
  }

export function getMateriaString(valorEnum: Materias): string {
    return Materias[valorEnum];
}