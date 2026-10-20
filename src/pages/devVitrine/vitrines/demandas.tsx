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
    file: {
      id: "f1",
      originalName: "funcoes-2-grau.docx",
      uploadedBy: "u-autor",
    },
    uploadedByName: "Ana Souza",
    lastEditedBy: "u-autor",
    lastEditedByName: "Ana Souza",
    lastEditedAt: "2026-09-02T12:00:00Z",
    subject: {
      id: "s1",
      name: "Funções",
      frente: { nome: "Álgebra", materia: "m1" },
    },
    ...over,
  }) as unknown as ContentDtoInput;

const minuto = (min: number) =>
  new Date(Date.UTC(2026, 8, 1, 12, min)).toISOString();
/** Cinco pessoas na linha do tempo (050): criadora, autora, aprovador, proponente, revisora. */
const timelineLonga = [
  { tipo: "criada", em: minuto(0), porId: "u-criador", por: "Carla Mendes" },
  {
    tipo: "enviada",
    em: minuto(10),
    porId: "u-autor",
    por: "Ana Souza",
    material: {
      fileContentId: "f1",
      tipo: "documento",
      originalName: "funcoes-2-grau.docx",
    },
  },
  {
    tipo: "rejeitada",
    em: minuto(20),
    porId: "u-bruno",
    por: "Bruno Costa",
    detalhe: "Faltou a lista de exercícios e o gabarito.",
  },
  { tipo: "resetada", em: minuto(25), porId: "u-bruno", por: "Bruno Costa" },
  {
    tipo: "enviada",
    em: minuto(30),
    porId: "u-autor",
    por: "Ana Souza",
    material: {
      fileContentId: "f1",
      tipo: "documento",
      originalName: "funcoes-2-grau-v2.docx",
    },
  },
  { tipo: "aprovada", em: minuto(40), porId: "u-bruno", por: "Bruno Costa" },
  {
    tipo: "proposta_enviada",
    em: minuto(50),
    porId: "u-dani",
    por: "Dani Reis",
    detalhe:
      "Gravei uma aula em vídeo cobrindo o mesmo conteúdo, acho que fica mais acessível.",
    material: { fileContentId: "f2", tipo: "video", videoId: "dQw4w9WgXcQ" },
  },
  {
    tipo: "proposta_recusada",
    em: minuto(55),
    porId: "u-sumido",
    por: "u-sumido",
    detalhe: "data aproximada",
  },
  {
    tipo: "proposta_enviada",
    em: minuto(60),
    porId: "u-dani",
    por: "Dani Reis",
    material: { fileContentId: "f3", tipo: "video", videoId: "dQw4w9WgXcQ" },
  },
  {
    tipo: "proposta_aprovada",
    em: minuto(70),
    porId: "u-eva",
    por: "Eva Lima",
  },
  {
    tipo: "material_substituido",
    em: minuto(70),
    porId: "u-dani",
    por: "Dani Reis",
    material: { fileContentId: "f3", tipo: "video", videoId: "dQw4w9WgXcQ" },
  },
  {
    tipo: "outro",
    em: minuto(80),
    porId: "u-bruno",
    por: "Bruno Costa",
    detalhe: "mensagem antiga do log",
  },
];

/** O arquivo, as propostas e o histórico vêm da api; aqui são falsos. */
const rotas = (historico = true): RotaFalsa[] => [
  {
    caminho: /\/content\/[^/]+\/timeline$/,
    resposta: {
      corpo: { eventos: historico ? timelineLonga : timelineLonga.slice(0, 1) },
    },
  },
  {
    caminho: /\/content\/file\//,
    resposta: {
      corpo: { buffer: btoa("PK"), contentType: "application/octet-stream" },
    },
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
              file: {
                _id: "f1",
                fileKey: "k1",
                originalName: "funcoes-2-grau.docx",
              },
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

const modal =
  (over: Partial<ContentDtoInput> = {}) =>
  () => <DemandaComPermissoes demand={demanda(over)} />;

/** tickets/048, card 07: motivo da rejeição, "Criado por"/"Enviado por". */
export const vitrineDemanda: Vitrine = {
  slug: "demanda",
  titulo: "Demanda de conteúdo (validar)",
  arquivo: "src/pages/dashContent/modals/validatedDemand.tsx",
  estados: [
    {
      slug: "pendente",
      titulo: "Pendente de validação",
      rotas: rotas(),
      render: modal(),
    },
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
      render: modal({
        createdByName: LONGO,
        uploadedByName: LONGO,
        lastEditedByName: LONGO,
      }),
    },
  ],
};
