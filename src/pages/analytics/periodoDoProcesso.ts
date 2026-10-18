import { UltimoProcesso } from "@/services/analytics/monitoramento";

/** Datas do processo em pt-BR; UTC para a data não andar um dia no fuso. */
const data = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" });

export const periodoDoProcesso = (p: UltimoProcesso) =>
  `${data(p.inicio)} – ${data(p.fim)}`;
