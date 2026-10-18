import { ModalAnularQuestao } from "@/components/molecules/anulacao/ModalAnularQuestao";
import { ModalAvisoAnulada } from "@/components/molecules/anulacao/ModalAvisoAnulada";
import { ModalCadernoComAnuladas } from "@/components/molecules/anulacao/ModalCadernoComAnuladas";
import { MotivoAnulacao } from "@/dtos/question/anulacao";
import { AnuladasDaProva } from "@/pages/dashProvas/modals/AnuladasDaProva";
import { CampoProvaDemo } from "./CampoProvaDemo";
import { colunasDeProva } from "@/pages/dashProvas/columns";
import type { Prova } from "@/dtos/prova/prova";
import QuestionBox from "@/components/atoms/questionBox";
import QuestionList from "@/components/molecules/questionList";
import { QuestionBoxStatus } from "@/enums/simulado/questionBoxStatus";
import type { AvisoDeRecalculo } from "@/pages/relatorioSimulado/AvisoDeRecalculo";
import { AvisoComToken } from "./AvisoComToken";
import { RotaFalsa } from "../fetchFalso";
import { Vitrine } from "../tipos";

const nada = () => {};
const modal = (props: Partial<Parameters<typeof ModalAnularQuestao>[0]> = {}) => () => (
  <ModalAnularQuestao
    numero={45}
    provaNome="Simulado 3 – Cursinho X"
    onConfirmar={nada}
    onCancelar={nada}
    {...props}
  />
);

const LONGA =
  "A alternativa C, dada como gabarito, está errada: o texto-base afirma o contrário no segundo parágrafo. " +
  "Nenhuma das outras alternativas responde à pergunta, então a questão não tem resposta correta. ".repeat(3);

const colunaAnuladas = colunasDeProva.find((c) => c.id === "anuladas")!;

/** tickets/042, cards 07 e 21. */
export const vitrineModalAnular: Vitrine = {
  slug: "modal-anular-questao",
  titulo: "Anular questão na prova",
  arquivo: "src/components/molecules/anulacao/ModalAnularQuestao.tsx",
  estados: [
    { slug: "vazio", titulo: "Vazio", render: modal() },
    {
      slug: "justificativa-curta",
      titulo: "Justificativa curta",
      render: modal({ inicial: { motivo: MotivoAnulacao.enunciadoComErro, justificativa: "curta" } }),
    },
    {
      slug: "outro",
      titulo: "Outro + texto longo",
      render: modal({ inicial: { motivo: MotivoAnulacao.outro, justificativa: LONGA.slice(0, 500) } }),
    },
    {
      slug: "enviando",
      titulo: "Enviando",
      render: modal({
        ocupado: true,
        inicial: { motivo: MotivoAnulacao.semAlternativaCorreta, justificativa: "Gabarito errado." },
      }),
    },
    {
      slug: "erro",
      titulo: "Erro",
      render: modal({
        erro: "Esta prova já tem resultados. A anulação em prova aplicada chega com o recálculo do relatório.",
        inicial: { motivo: MotivoAnulacao.semAlternativaCorreta, justificativa: "Gabarito errado." },
      }),
    },
  ],
};

const anulacao = {
  provaId: "p1",
  numero: 45,
  motivo: MotivoAnulacao.semAlternativaCorreta,
  justificativa: "A alternativa C, dada como gabarito, está errada.",
  em: "2026-10-17T00:00:00Z",
};

/** tickets/042, card 07: o bloco da aba Classificação e a lista da tela da prova. */
export const vitrineAnulacaoNaProva: Vitrine = {
  slug: "anulacao-na-prova",
  titulo: "Anulação na aba e na prova",
  arquivo: "src/pages/dashQuestionNew/modals/tabs/TabClassificacao/AnulacaoDaProva.tsx",
  estados: [
    {
      slug: "valida",
      titulo: "Válida (pode anular)",
      render: () => <CampoProvaDemo podeAnular />,
    },
    {
      slug: "anulada",
      titulo: "Anulada (dono, 1 prova)",
      render: () => (
        <CampoProvaDemo podeAnular anulacoes={[{ ...anulacao, provaId: "p1", numero: 45, justificativa: LONGA }]} />
      ),
    },
    {
      slug: "anulada-varias",
      titulo: "Anulada em 3 provas",
      render: () => (
        <CampoProvaDemo
          podeAnular
          anulacoes={[
            { ...anulacao, provaId: "p0", numero: 12 },
            { ...anulacao, provaId: "p1", numero: 45, justificativa: LONGA },
            { ...anulacao, provaId: "p2", numero: 88, motivo: MotivoAnulacao.repetidaDeOutroExame },
          ]}
        />
      ),
    },
    {
      slug: "anulada-sem-permissao",
      titulo: "Anulada (outro cursinho)",
      render: () => <CampoProvaDemo podeAnular={false} anulacoes={[{ ...anulacao, provaId: "p1", numero: 45 }]} />,
    },
    {
      slug: "coluna-da-lista",
      titulo: "Coluna Anuladas da lista",
      render: () => (
        <table className="w-full max-w-md text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-1">Prova</th>
              <th className="py-1 text-center">Anuladas</th>
            </tr>
          </thead>
          <tbody>
            {[
              { nome: "Simulado 3", totalAnuladas: 2 },
              { nome: "ENEM 2022 – Dia 2", totalAnuladas: 1 },
              { nome: "Revisão final", totalAnuladas: 0 },
              { nome: "Prova antiga (ms sem o campo)" },
            ].map((p) => (
              <tr key={p.nome} className="border-t">
                <td className="py-2">{p.nome}</td>
                <td className="py-2 text-center">{colunaAnuladas.cell(p as Prova)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    },
    {
      slug: "lista-da-prova",
      titulo: "Tela da prova",
      render: () => (
        <AnuladasDaProva
          questoes={[
            ...Array.from({ length: 88 }, (_, i) => ({ numero: i + 1 })),
            { numero: 45, anulacao },
            { numero: 90, anulacao: { ...anulacao, motivo: MotivoAnulacao.repetidaDeOutroExame, justificativa: LONGA } },
          ]}
        />
      ),
    },
  ],
};

const daQuestao = (i: number, justificativa = anulacao.justificativa) => ({
  provaId: `p${i}`,
  provaNome: ["ENEM 2022 – Dia 2", "Simulado 3 – Cursinho X", "Simulado de Outubro – Cursinho Esperança da Zona Leste", "Revisão final"][i % 4],
  numero: [45, 12, 88, 3][i % 4],
  motivo: [MotivoAnulacao.semAlternativaCorreta, MotivoAnulacao.enunciadoComErro, MotivoAnulacao.repetidaDeOutroExame, MotivoAnulacao.outro][i % 4],
  justificativa,
  em: "2026-10-01T15:00:00Z",
});
const aviso = (anulacoes: ReturnType<typeof daQuestao>[]) => () => (
  <ModalAvisoAnulada anulacoes={anulacoes} numero={7} provaNome="Minha prova" onEscolher={nada} onCancelar={nada} />
);

/** tickets/042, card 08. */
export const vitrineAvisoAnulada: Vitrine = {
  slug: "aviso-questao-anulada",
  titulo: "Aviso ao adicionar questão anulada",
  arquivo: "src/components/molecules/anulacao/ModalAvisoAnulada.tsx",
  estados: [
    { slug: "uma", titulo: "1 anulação", render: aviso([daQuestao(0)]) },
    { slug: "quatro", titulo: "4 anulações", render: aviso([0, 1, 2, 3].map((i) => daQuestao(i, LONGA.slice(0, 200)))) },
    { slug: "longa", titulo: "Justificativa longa", render: aviso([daQuestao(0, LONGA.slice(0, 500))]) },
  ],
};

/** tickets/042, card 09. */
export const vitrineCadernoComAnuladas: Vitrine = {
  slug: "caderno-com-anuladas",
  titulo: "Caderno com questão anulada",
  arquivo: "src/components/molecules/anulacao/ModalCadernoComAnuladas.tsx",
  estados: [
    { slug: "uma", titulo: "1 anulada", render: () => <ModalCadernoComAnuladas numeros={[45]} onConfirmar={nada} onCancelar={nada} /> },
    {
      slug: "varias",
      titulo: "Várias",
      render: () => <ModalCadernoComAnuladas numeros={[3, 12, 45, 88, 136]} onConfirmar={nada} onCancelar={nada} />,
    },
  ],
};

const grade = (anuladas: number[]) => () => (
  <QuestionList
    selectQuestion={nada}
    questions={Array.from({ length: 90 }, (_, i) => ({
      id: i,
      number: i,
      status: anuladas.includes(i)
        ? QuestionBoxStatus.anulada
        : i === 1
          ? QuestionBoxStatus.active
          : i < 20
            ? QuestionBoxStatus.solved
            : QuestionBoxStatus.unread,
    }))}
  />
);

/** tickets/042, card 11. */
export const vitrineQuestaoAnuladaNoSimulado: Vitrine = {
  slug: "questionBox",
  titulo: "Simulado: questão anulada",
  arquivo: "src/components/atoms/questionBox/index.tsx",
  estados: [
    {
      slug: "anulada",
      titulo: "Caixa anulada",
      render: () => (
        <div className="flex gap-2 p-8">
          <QuestionBox number={44} status={QuestionBoxStatus.solved} />
          <QuestionBox number={45} status={QuestionBoxStatus.anulada} />
          <QuestionBox number={46} status={QuestionBoxStatus.active} />
        </div>
      ),
    },
    { slug: "questionList", titulo: "Grade de 90 com anuladas", render: grade([0, 44, 45, 89]) },
  ],
};

const jobDaVitrine = (o: Record<string, unknown> = {}) => ({
  id: "j1",
  status: "processando" as const,
  total: 132,
  processados: 48,
  falhas: 0,
  regravados: 0,
  ...o,
});
const situacao = (o: Record<string, unknown>): RotaFalsa[] => [
  { caminho: /recalculo-anulacao$/, resposta: { corpo: { divergentes: 0, anulacoes: [], jobAtivo: null, ultimoJob: null, ...o } } },
];
const avisoDeRecalculo = (props: Partial<Parameters<typeof AvisoDeRecalculo>[0]> = {}) => () => (
  <AvisoComToken {...props} />
);

/** tickets/042, card 15. ⚠️ "concluído" e "com falhas" aparecem depois do 1º polling (3 s). */
export const vitrineAvisoDeRecalculo: Vitrine = {
  slug: "aviso-recalculo",
  titulo: "Relatório desatualizado",
  arquivo: "src/pages/relatorioSimulado/AvisoDeRecalculo.tsx",
  estados: [
    { slug: "divergente", titulo: "Divergente", render: avisoDeRecalculo() },
    {
      slug: "desanulada",
      titulo: "Desanulada (voltou a valer)",
      render: avisoDeRecalculo({ anuladas: [], desanuladas: [45], divergentes: 30 }),
    },
    {
      slug: "rodando",
      titulo: "Rodando",
      rotas: situacao({ divergentes: 84, jobAtivo: jobDaVitrine() }),
      render: avisoDeRecalculo({ jobAtivo: jobDaVitrine() }),
    },
    {
      slug: "concluido",
      titulo: "Concluído",
      rotas: situacao({ ultimoJob: jobDaVitrine({ status: "concluido", processados: 132, regravados: 132 }) }),
      render: avisoDeRecalculo({ jobAtivo: jobDaVitrine() }),
    },
    {
      slug: "com-falhas",
      titulo: "Com falhas",
      rotas: situacao({ divergentes: 3, ultimoJob: jobDaVitrine({ status: "concluido", processados: 132, falhas: 3, regravados: 129 }) }),
      render: avisoDeRecalculo({ jobAtivo: jobDaVitrine() }),
    },
    {
      slug: "varias",
      titulo: "Várias anuladas",
      render: avisoDeRecalculo({
        anuladas: [3, 45, 90].map((numero) => ({ numero, motivo: MotivoAnulacao.outro, justificativa: "x" })),
      }),
    },
  ],
};
