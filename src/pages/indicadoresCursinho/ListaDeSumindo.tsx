import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelError } from "@/pages/dashboard/components/Panel";
import { type AlunoSumindo, getSumindo } from "@/services/indicadores";
import { useAuthStore } from "@/store/auth";

const diaCurto = (dia: string) => `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;

/** Só os dígitos, para o link do WhatsApp (com 55 quando falta o país). */
const linkDoWhatsapp = (telefone: string) => {
  const digitos = telefone.replace(/\D/g, "");
  return `https://wa.me/${digitos.length <= 11 ? `55${digitos}` : digitos}`;
};

/**
 * A lista de quem está sumindo (tickets/033, card 08) — tem nome de aluno, por
 * isso só é buscada quando abre, e nunca entra no snapshot.
 */
export function ListaDeSumindo({
  periodoId,
  aberta,
  aoFechar,
}: {
  periodoId: string;
  aberta: boolean;
  aoFechar: () => void;
}) {
  const token = useAuthStore((s) => s.data.token);
  const [alunos, setAlunos] = useState<AlunoSumindo[] | null>(null);
  const [erro, setErro] = useState(false);

  const carregar = () => {
    setErro(false);
    setAlunos(null);
    getSumindo(token, periodoId)
      .then(setAlunos)
      .catch(() => setErro(true));
  };

  useEffect(() => {
    if (aberta) carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberta, periodoId, token]);

  return (
    <Dialog open={aberta} onOpenChange={(v) => !v && aoFechar()}>
      <DialogContent className="max-h-[85vh] w-[calc(100vw-2rem)] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quem está sumindo</DialogTitle>
          <DialogDescription>
            Alunos com a matrícula em vigor que faltaram às 3 últimas aulas
            seguidas da turma.
          </DialogDescription>
        </DialogHeader>
        {erro ? (
          <PanelError retry={carregar} />
        ) : alunos === null ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : alunos.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Ninguém sumindo agora.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {alunos.map((a) => (
              <li key={a.alunoId} className="py-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-marine">{a.nome}</p>
                    <p className="text-slate-500">
                      {a.turma} ·{" "}
                      {a.ultimaPresenca
                        ? `última presença em ${diaCurto(a.ultimaPresenca)}`
                        : "não veio a nenhuma aula"}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-orange/[0.12] px-2 py-0.5 text-xs font-semibold text-[#b35300]">
                    {a.faltasSeguidas} faltas seguidas
                  </span>
                </div>
                {a.telefone && (
                  <a
                    href={linkDoWhatsapp(a.telefone)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs font-medium text-marine underline-offset-2 hover:underline"
                  >
                    Chamar no WhatsApp ({a.telefone})
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
