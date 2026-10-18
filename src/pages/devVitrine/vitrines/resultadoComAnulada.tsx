import { SimulationHistoryHeader } from "@/components/organisms/simulationHistoryHeader";
import type { HistoricoDTO } from "@/dtos/historico/historicoDTO";
import { Vitrine } from "../tipos";

const N = 10;
function historico(o: Partial<HistoricoDTO> & { anulada45?: boolean } = {}): HistoricoDTO {
  const { anulada45 = true, ...resto } = o;
  const questoes = Array.from({ length: N }, (_, i) => ({
    _id: `q${i + 1}`,
    numero: i + 1,
    ...(anulada45 && i === 4
      ? { anulada: true, anulacao: { motivo: "sem_alternativa_correta", justificativa: "Gabarito errado." } }
      : {}),
  }));
  return {
    _id: "h1",
    usuario: "u",
    ano: 2026,
    simulado: {
      _id: "s",
      nome: "Simulado 3",
      categoria: { nome: "Simulado 3", quantidadeTotalQuestao: N } as never,
      questoes: questoes as never,
      aproveitamento: 0.5,
      vezesRespondido: 1,
    },
    respostas: questoes.map((q, i) => ({
      questao: q._id,
      alternativaCorreta: "A",
      alternativaEstudante: i % 2 ? "B" : "A",
      ...(resto.numerosAnulados && i === 4 ? { anulada: true } : {}),
    })) as never,
    tempoRealizado: 0,
    questoesRespondidas: resto.totalConsiderado ?? N,
    cartaoCode: "001",
    status: "completed",
    aproveitamento: {
      geral: 0.5,
      materias: [{ id: "m", nome: "Matemática", aproveitamento: 0.5, frentes: [{ id: "f", nome: "Álgebra", aproveitamento: 0.5 }] }],
    },
    createdAt: new Date() as never,
    ...resto,
  } as HistoricoDTO;
}

/** tickets/042, card 16 — o resultado do aluno (a tela do push "nota atualizada"). */
export const vitrineResultadoComAnulada: Vitrine = {
  slug: "resultado-com-anulada",
  titulo: "Resultado do aluno com anulada",
  arquivo: "src/components/organisms/simulationHistoryHeader/index.tsx",
  estados: [
    {
      slug: "com-anulada",
      titulo: "Com anulada",
      render: () => <SimulationHistoryHeader historic={historico({ totalConsiderado: 9, numerosAnulados: [5] })} />,
    },
    {
      slug: "divergente",
      titulo: "Divergente",
      render: () => <SimulationHistoryHeader historic={historico({ divergente: true })} />,
    },
    {
      slug: "recalculado",
      titulo: "Recalculado",
      render: () => (
        <SimulationHistoryHeader
          historic={historico({ totalConsiderado: 9, numerosAnulados: [5], recalculadoEm: "2026-10-18T15:00:00Z" })}
        />
      ),
    },
  ],
};
