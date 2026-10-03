import type { Indicadores } from "@/services/indicadores";

interface Props {
  dados: Indicadores;
}

/**
 * As áreas da tela: Alunos (02–05, 08), Turmas (06), Frequência (07) e
 * Desempenho (09). Cada card da série acrescenta a sua aqui.
 */
export function SecoesDosIndicadores({ dados }: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
      Os indicadores das {dados.turmas.length} turmas deste período aparecem
      aqui.
    </div>
  );
}

/** Título de uma área da tela, com os cards em grade abaixo. */
export function Area({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-marine">{titulo}</h2>
      {children}
    </section>
  );
}
