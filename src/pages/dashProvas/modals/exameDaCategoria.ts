import type { FormFieldOption } from "../../../components/molecules/formField";
import type { ICategoria } from "../../../dtos/categoria/categoria";

/**
 * Os exames das categorias, sem repetir e em ordem alfabética, com a opção vazia no topo —
 * o primeiro campo do "Nova prova".
 */
export function opcoesDeExame(
  categorias: Pick<ICategoria, "exame">[],
): FormFieldOption[] {
  const porId = new Map<string, string>();
  for (const c of categorias) {
    if (c.exame?._id) porId.set(c.exame._id, c.exame.nome);
  }
  return [
    { label: "", value: "" },
    ...[...porId.entries()]
      .sort(([, a], [, b]) => a.localeCompare(b, "pt-BR"))
      .map(([value, label]) => ({ label, value })),
  ];
}

/** As categorias do exame escolhido; sem exame, nenhuma. */
export function categoriasDoExame<C extends Pick<ICategoria, "exame">>(
  categorias: C[],
  exameId: string | undefined,
): C[] {
  if (!exameId) return [];
  return categorias.filter((c) => c.exame?._id === exameId);
}
