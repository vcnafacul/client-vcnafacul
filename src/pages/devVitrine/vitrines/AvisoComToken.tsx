import { MotivoAnulacao } from "@/dtos/question/anulacao";
import { AvisoDeRecalculo } from "@/pages/relatorioSimulado/AvisoDeRecalculo";
import { useAuthStore } from "@/store/auth";

/** O token do usuário falso da vitrine — o `fetchWrapper` decodifica o JWT. */
export function AvisoComToken(props: Partial<Parameters<typeof AvisoDeRecalculo>[0]>) {
  const {
    data: { token },
  } = useAuthStore();
  return (
    <AvisoDeRecalculo
      fonte={{ tipo: "simulado", simuladoId: "s1" }}
      token={token}
      divergentes={132}
      anuladas={[{ numero: 45, motivo: MotivoAnulacao.semAlternativaCorreta, justificativa: "x" }]}
      jobAtivo={null}
      aoConcluir={() => {}}
      {...props}
    />
  );
}
