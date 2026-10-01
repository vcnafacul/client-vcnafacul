import { Essay } from "@/dtos/essay";

/**
 * A nota que o estudante vê: a da correção humana, se houver, senão a da IA.
 * Era só "Nota IA" — com a IA desligada, redação corrigida aparecia com "-".
 */
export function notaDaRedacao(essay: Essay): number | null {
  const humana = essay.reviews?.find((r) => r.reviewType === "HUMAN");
  const ia = essay.reviews?.find((r) => r.reviewType === "AI");
  return (humana ?? ia)?.totalScore ?? null;
}
