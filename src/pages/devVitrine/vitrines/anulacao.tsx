import { ModalAnularQuestao } from "@/components/molecules/anulacao/ModalAnularQuestao";
import { MotivoAnulacao } from "@/dtos/question/anulacao";
import { AnuladasDaProva } from "@/pages/dashProvas/modals/AnuladasDaProva";
import { AnulacaoDaProva } from "@/pages/dashQuestionNew/modals/tabs/TabClassificacao/AnulacaoDaProva";
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

/** tickets/042, card 07. */
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
      render: () => (
        <AnulacaoDaProva questaoId="q" provaId="p1" provaNome="Simulado 3" numero={45} podeAnular token="" />
      ),
    },
    {
      slug: "anulada",
      titulo: "Anulada (dono)",
      render: () => (
        <AnulacaoDaProva
          questaoId="q"
          provaId="p1"
          provaNome="Simulado 3"
          numero={45}
          anulacao={{ ...anulacao, justificativa: LONGA }}
          podeAnular
          token=""
        />
      ),
    },
    {
      slug: "anulada-sem-permissao",
      titulo: "Anulada (outro cursinho)",
      render: () => (
        <AnulacaoDaProva
          questaoId="q"
          provaId="p1"
          provaNome="Simulado 3"
          numero={45}
          anulacao={anulacao}
          podeAnular={false}
          token=""
        />
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
