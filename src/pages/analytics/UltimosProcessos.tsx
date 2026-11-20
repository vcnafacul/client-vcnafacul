import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  SituacaoDoProcesso,
  UltimoProcesso,
} from "@/services/analytics/monitoramento";
import { periodoDoProcesso } from "./periodoDoProcesso";

const SITUACAO: Record<SituacaoDoProcesso, { texto: string; classe: string }> = {
  aberto: { texto: "Aberto", classe: "bg-success-muted text-success border-success/40" },
  encerrado: { texto: "Encerrado", classe: "bg-page text-muted-foreground border-border" },
  futuro: { texto: "Futuro", classe: "bg-primary/10 text-foreground border-primary/30" },
};


function Situacao({ situacao }: { situacao: SituacaoDoProcesso }) {
  const s = SITUACAO[situacao];
  return (
    <span
      className={`inline-block shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-caption font-medium ${s.classe}`}
    >
      {s.texto}
    </span>
  );
}

type Props = {
  processos: UltimoProcesso[];
  carregando: boolean;
  /** Visão da plataforma: mostra de qual cursinho é cada processo. */
  mostrarCursinho: boolean;
};

/** Os últimos processos seletivos, sem testes (tickets/044, card 08, D7). */
export function UltimosProcessos({ processos, carregando, mostrarCursinho }: Props) {
  return (
    <div className="shadow-md bg-white p-3 rounded-sm">
      <h3 className="font-semibold text-foreground mb-2">
        Últimos processos seletivos
      </h3>
      {carregando ? (
        <div className="space-y-2" aria-label="Carregando processos">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : processos.length === 0 ? (
        <p className="py-6 text-center text-body text-muted-foreground">
          Nenhum processo seletivo ainda.
        </p>
      ) : (
        <>
          {/* Celular (abaixo de sm = 768px): um card por processo, sem scroll lateral. */}
          <ul className="space-y-2 sm:hidden">
            {processos.map((p) => (
              <li key={p.id} className="rounded-sm border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium break-words min-w-0">{p.nome}</p>
                  <Situacao situacao={p.situacao} />
                </div>
                {mostrarCursinho && (
                  <p className="text-body text-muted-foreground break-words">{p.cursinho.nome}</p>
                )}
                <p className="text-caption text-muted-foreground mt-1">{periodoDoProcesso(p)}</p>
                <p className="text-body mt-1">
                  <strong>{p.inscricoes}</strong> inscrições ·{" "}
                  <strong>{p.matriculas}</strong> matrículas
                </p>
              </li>
            ))}
          </ul>
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  {mostrarCursinho && <TableHead>Cursinho</TableHead>}
                  <TableHead>Processo</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">Inscrições</TableHead>
                  <TableHead className="text-right">Matrículas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processos.map((p) => (
                  <TableRow key={p.id}>
                    {mostrarCursinho && (
                      <TableCell className="max-w-[16rem] break-words">
                        {p.cursinho.nome}
                      </TableCell>
                    )}
                    <TableCell className="max-w-[18rem] break-words font-medium">
                      {p.nome}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {periodoDoProcesso(p)}
                    </TableCell>
                    <TableCell>
                      <Situacao situacao={p.situacao} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {p.inscricoes}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {p.matriculas}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
      <p className="text-caption text-muted-foreground mt-2">
        Sem processos de teste. Os 10 mais recentes.
      </p>
    </div>
  );
}
