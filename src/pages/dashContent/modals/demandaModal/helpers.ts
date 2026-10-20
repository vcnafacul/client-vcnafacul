import type { ContentDtoInput } from "@/dtos/content/contentDtoInput";
import { StatusContent } from "@/enums/content/statusContent";
import { StatusEnum } from "@/enums/generic/statusEnum";
import type { PessoaDaDemanda } from "./PessoasDaDemanda";

/** "Ana Souza" → "AS"; "Ana" → "A"; vazio → "?". */
export function iniciais(nome?: string): string {
  const partes = (nome ?? "").trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return "?";
  const [a, b] = [partes[0], partes[partes.length - 1]];
  return (a[0] + (partes.length > 1 ? b[0] : "")).toUpperCase();
}

/*
  ⚠️ amber/emerald/rose, não yellow/green/red: o `tailwind.config` redefine
  `red`, `yellow` e `green` como cor única, então `bg-red-100` não existe e
  o chip saía transparente (era assim no ValidatedDemand também).
*/
const STATUS: Record<number, { rotulo: string; classe: string }> = {
  [StatusContent.Pending_Upload]: {
    rotulo: "Aguardando envio",
    classe: "bg-gray-100 text-gray-700",
  },
  [StatusEnum.Pending]: {
    rotulo: "Pendente de validação",
    classe: "bg-amber-100 text-amber-800",
  },
  [StatusEnum.Approved]: {
    rotulo: "Aprovada",
    classe: "bg-emerald-100 text-emerald-800",
  },
  [StatusEnum.Rejected]: {
    rotulo: "Rejeitada",
    classe: "bg-rose-100 text-rose-800",
  },
};

export function statusDaDemanda(status: number) {
  return STATUS[status] ?? { rotulo: "—", classe: "bg-gray-100 text-gray-700" };
}

/** As pessoas do cabeçalho, na ordem em que entram na vida da demanda. */
export function pessoasDe(demand: ContentDtoInput): PessoaDaDemanda[] {
  const temMaterial = !!(
    demand.file?.id ?? (demand.file as { _id?: string } | undefined)?._id
  );
  return [
    {
      papel: "Criada por",
      nome: demand.createdByName,
      id: demand.userId,
      em: demand.createdAt ? String(demand.createdAt) : undefined,
    },
    ...(temMaterial
      ? [
          {
            papel: "Material de",
            nome: demand.uploadedByName,
            id: demand.file?.uploadedBy,
            em: demand.lastEditedAt,
          },
        ]
      : []),
    ...(demand.approvedBy
      ? [
          {
            papel: "Aprovada por",
            nome: demand.approvedByName,
            id: demand.approvedBy,
            em: demand.approvedAt,
          },
        ]
      : []),
  ];
}

export const rotuloDoMaterial = (file?: {
  tipo?: string;
  originalName?: string;
}) => (file?.tipo === "video" ? "▶ Vídeo" : file?.originalName || "Arquivo");
