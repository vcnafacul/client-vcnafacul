import type { ContentDtoInput } from "@/dtos/content/contentDtoInput";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { RotaFalsa } from "../fetchFalso";
import { DemandaComPermissoes } from "./DemandaComPermissoes";
import { Vitrine } from "../tipos";

const LONGO =
  "Maria Aparecida de Albuquerque Figueiredo dos Santos Carvalho Nascimento";

const demanda = (over: Partial<ContentDtoInput> = {}): ContentDtoInput =>
  ({
    id: "d1",
    title: "Funções do 2º grau: vértice, raízes e gráfico",
    description:
      "Material completo com teoria, exemplos resolvidos e uma lista de 20 exercícios com gabarito.",
    status: StatusEnum.Pending,
    createdAt: "2026-09-01T12:00:00Z",
    userId: "u-criador",
    createdByName: "Carla Mendes",
    file: { id: "f1", originalName: "funcoes-2-grau.docx", uploadedBy: "u-autor" },
    uploadedByName: "Ana Souza",
    lastEditedBy: "u-autor",
    lastEditedByName: "Ana Souza",
    lastEditedAt: "2026-09-02T12:00:00Z",
    subject: { id: "s1", name: "Funções", frente: { nome: "Álgebra", materia: "m1" } },
    ...over,
  }) as unknown as ContentDtoInput;

/** O arquivo, as propostas e o histórico vêm da api; aqui são falsos. */
const rotas = (historico = true): RotaFalsa[] => [
  {
    caminho: /\/content\/file\//,
    resposta: { corpo: { buffer: btoa("PK"), contentType: "application/octet-stream" } },
  },
  { caminho: /\/content\/[^/]+\/proposals$/, resposta: { corpo: [] } },
  {
    caminho: /\/content\/[^/]+\/file-history$/,
    resposta: {
      corpo: historico
        ? [
            {
              _id: "h1",
              content: "d1",
              file: { _id: "f1", fileKey: "k1", originalName: "funcoes-2-grau.docx" },
              uploadedBy: "u-autor",
              uploadedByName: "Ana Souza",
              source: "initial_upload",
              createdAt: "2026-09-02T12:00:00Z",
            },
          ]
        : [],
    },
  },
];

const modal = (over: Partial<ContentDtoInput> = {}) => () => (
  <DemandaComPermissoes demand={demanda(over)} />
);

/** tickets/048, card 07: motivo da rejeição, "Criado por"/"Enviado por". */
export const vitrineDemanda: Vitrine = {
  slug: "demanda",
  titulo: "Demanda de conteúdo (validar)",
  arquivo: "src/pages/dashContent/modals/validatedDemand.tsx",
  estados: [
    { slug: "pendente", titulo: "Pendente de validação", rotas: rotas(), render: modal() },
    {
      slug: "rejeitada-com-motivo",
      titulo: "Rejeitada, com motivo",
      rotas: rotas(),
      render: modal({
        status: StatusEnum.Rejected,
        rejectionReason:
          "Faltou a lista de exercícios e o gabarito. A seção de gráfico está com a figura cortada; " +
          "refazer a imagem em resolução maior e conferir o vértice no exemplo 3.",
      }),
    },
    {
      slug: "sem-arquivo",
      titulo: "Sem arquivo (aguardando envio)",
      rotas: rotas(false),
      render: modal({
        status: 3 as unknown as StatusEnum,
        file: undefined,
        uploadedByName: undefined,
        lastEditedBy: undefined,
        lastEditedByName: undefined,
        lastEditedAt: undefined,
      }),
    },
    {
      slug: "nomes-longos",
      titulo: "Nomes longos",
      rotas: rotas(),
      render: modal({ createdByName: LONGO, uploadedByName: LONGO, lastEditedByName: LONGO }),
    },
  ],
};
