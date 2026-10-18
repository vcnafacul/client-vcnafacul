import type { AnulacaoNaProva } from "@/dtos/question/anulacao";
import { AnulacaoDaProva } from "@/pages/dashQuestionNew/modals/tabs/TabClassificacao/AnulacaoDaProva";
import { AnuladaEm } from "@/pages/dashQuestionNew/modals/tabs/TabClassificacao/AnuladaEm";

const NOMES: Record<string, string> = {
  p0: "ENEM 2022 – Dia 2",
  p1: "Simulado 3 – Cursinho X",
  p2: "Simulado de Outubro – Cursinho Esperança da Zona Leste",
};

/**
 * O topo da aba Classificação como fica no card 21: o aviso único (`AnuladaEm`)
 * e as ações à direita do título "Prova". A prova em foco é a `p1`.
 */
export function CampoProvaDemo({ podeAnular, anulacoes }: { podeAnular: boolean; anulacoes?: AnulacaoNaProva[] }) {
  return (
    <div className="flex flex-col gap-4">
      <AnuladaEm anulacoes={anulacoes} nomeDaProva={(id) => NOMES[id]} provaEmFoco="p1" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-sm font-semibold text-gray-600">Prova *</label>
            <AnulacaoDaProva
              questaoId="q"
              provaId="p1"
              provaNome={NOMES.p1}
              numero={45}
              anulacao={anulacoes?.find((a) => a.provaId === "p1")}
              podeAnular={podeAnular}
              token=""
            />
          </div>
          <div className="h-9 rounded-md border px-3 py-2 text-sm">{NOMES.p1}</div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-600">Número da Questão</label>
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200 text-gray-400">45</div>
        </div>
      </div>
    </div>
  );
}
