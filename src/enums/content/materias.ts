export enum Materias {
  LinguaPortuguesa,
  LinguaEstrangeira,
  Artes,
  Biologia,
  Fisica,
  Quimica,
  Matematica,
  Historia,
  Geografia,
  Filosofia,
  Sociologia,
  Atualidades,
}

export function getMateriaString(valorEnum: Materias): string {
  return Materias[valorEnum];
}

