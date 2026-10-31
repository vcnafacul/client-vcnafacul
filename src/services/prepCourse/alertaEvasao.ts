import { partnerPrepCourseAlertaEvasao } from "@/services/urls";
import fetchWrapper from "@/utils/fetchWrapper";

/** Alerta de risco de evasão do cursinho (tickets/054). `percentual` null = desligado. */
export type AlertaEvasao = {
  percentual: number | null;
  minimoDeAulas: number;
};

export async function getAlertaEvasao(token: string): Promise<AlertaEvasao> {
  const response = await fetchWrapper(partnerPrepCourseAlertaEvasao, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const res = await response.json();
  if (response.status !== 200) throw res;
  return res;
}

export async function salvarAlertaEvasao(
  token: string,
  alerta: AlertaEvasao,
): Promise<AlertaEvasao> {
  const response = await fetchWrapper(partnerPrepCourseAlertaEvasao, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(alerta),
  });
  const res = await response.json();
  if (response.status !== 200) throw res;
  return res;
}
