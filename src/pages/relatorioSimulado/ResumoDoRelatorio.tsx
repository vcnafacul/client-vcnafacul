import { dashV2 } from "@/components/dashV2";
import type { ResumoDoRelatorio as Resumo } from "@/dtos/relatorioSimulado/relatorioSimulado";
import { cn } from "@/lib/utils";

function Numero({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <div className={cn("text-2xl font-semibold", dashV2.text.primary)}>
        {valor}
      </div>
      <div className={cn("text-xs", dashV2.text.muted)}>{rotulo}</div>
    </div>
  );
}

/**
 * ⚠️ **As duas contagens aparecem sempre.** Sem elas ninguém entende a
 * diferença entre "30 alunos" e "27 no cálculo", e a média parece errada.
 */
export function ResumoDoRelatorio({ resumo }: { resumo: Resumo }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start gap-8">
        <Numero
          rotulo="Estudantes no recorte"
          valor={String(resumo.totalNoRecorte)}
        />
        <Numero
          rotulo="Com leitura concluída"
          valor={String(resumo.comLeituraConcluida)}
        />
        <Numero
          rotulo="Aproveitamento médio"
          // ⚠️ `null` vira travessão. "0%" afirmaria que a turma zerou.
          valor={
            resumo.aproveitamentoGeral === null
              ? "—"
              : `${Math.round(resumo.aproveitamentoGeral * 100)}%`
          }
        />
      </div>

      {/*
        ⚠️ Escrito na tela, não só no código. Um relatório que silenciosamente
        ignora quem respondeu online gera "cadê o fulano?" na primeira semana.
      */}
      <p className={cn("text-xs", dashV2.text.muted)}>
        Este relatório considera apenas quem respondeu por cartão-resposta. Quem
        resolveu o simulado pela plataforma não aparece aqui.
      </p>

      {/*
        ⚠️ Contado, NUNCA listado: o nome de quem saiu do cursinho não é
        informação que este relatório deva expor. Sem a nota, os totais não
        batem e a leitura natural é "o sistema perdeu cartão".
      */}
      {resumo.linhasSemEstudanteAtivo > 0 && (
        <p className={cn("text-xs", dashV2.text.muted)}>
          {resumo.linhasSemEstudanteAtivo} cartão(ões) enviado(s) por estudantes
          que não estão mais ativos nesta turma ou cursinho não aparecem na
          lista.
        </p>
      )}
    </section>
  );
}
