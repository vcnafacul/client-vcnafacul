import type { ContentDtoInput } from "@/dtos/content/contentDtoInput";
import type { EventoDaTimeline } from "@/dtos/content/timelineDto";
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

const tipoDoMaterial = (e: EventoDaTimeline) =>
  e.material ? ` (${e.material.tipo === "video" ? "vídeo" : "documento"})` : "";

/** O que a pessoa fez, para ler depois do nome: "Ana enviou o material (vídeo)". */
export function fraseDoEvento(e: EventoDaTimeline): string {
  switch (e.tipo) {
    case "criada":
      return "criou a demanda";
    case "enviada":
      return `enviou o material${tipoDoMaterial(e)}`;
    case "aprovada":
      return "aprovou a demanda";
    case "rejeitada":
      return "rejeitou a demanda";
    case "resetada":
      return "devolveu a demanda para a fila de envio";
    case "proposta_enviada":
      return `propôs um ajuste${tipoDoMaterial(e)}`;
    case "proposta_aprovada":
      return "aprovou a proposta de ajuste";
    case "proposta_recusada":
      return "recusou a proposta de ajuste";
    case "material_substituido":
      return `teve o material substituído pelo da proposta${tipoDoMaterial(e)}`;
    default:
      return "registrou uma alteração";
  }
}
