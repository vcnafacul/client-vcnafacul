import type { ContentDtoInput } from "@/dtos/content/contentDtoInput";
import { StatusEnum } from "@/enums/generic/statusEnum";
import ShowDemand from "@/pages/dashContent/modals/showDemand";
import Subject from "@/pages/subject";
import { RotaFalsa } from "../fetchFalso";
import { Vitrine } from "../tipos";
import { DemandaComPermissoes } from "./DemandaComPermissoes";

const nada = () => {};
const VIDEO = "dQw4w9WgXcQ";
const LONGO =
  "Maria Aparecida de Albuquerque Figueiredo dos Santos Carvalho Nascimento";
const minuto = (min: number) =>
  new Date(Date.UTC(2026, 8, 1, 12, min)).toISOString();

const base = {
  id: "d1",
  title: "Funções do 2º grau: vértice, raízes e gráfico",
  description:
    "Material completo com teoria, exemplos resolvidos e uma lista de 20 exercícios com gabarito.",
  createdAt: "2026-09-01T12:00:00Z",
  userId: "u-criador",
  createdByName: "Carla Mendes",
  subject: {
    id: "s1",
    name: "Funções",
    frente: { nome: "Álgebra", materia: "m1" },
  },
};
const documento = {
  id: "f1",
  originalName: "funcoes-2-grau.docx",
  uploadedBy: "u-autor",
  tipo: "documento",
};
const video = {
  id: "f2",
  originalName: "",
  uploadedBy: "u-dani",
  tipo: "video",
  videoId: VIDEO,
};
const comMaterial = {
  ...base,
  file: documento,
  uploadedByName: "Ana Souza",
  lastEditedBy: "u-autor",
  lastEditedByName: "Ana Souza",
  lastEditedAt: "2026-09-02T12:00:00Z",
};

const demanda = (over: object): ContentDtoInput =>
  ({ ...comMaterial, ...over }) as unknown as ContentDtoInput;

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
    material: { fileContentId: "f2", tipo: "video", videoId: VIDEO },
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
    material: { fileContentId: "f3", tipo: "video", videoId: VIDEO },
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
    material: { fileContentId: "f3", tipo: "video", videoId: VIDEO },
  },
  {
    tipo: "outro",
    em: minuto(80),
    porId: "u-bruno",
    por: "Bruno Costa",
    detalhe: "mensagem antiga do log",
  },
];

const propostas = [
  {
    _id: "p1",
    content: "d1",
    file: { _id: "f2", tipo: "video", videoId: VIDEO },
    status: 0,
    author: "u-dani",
    authorName: "Dani Reis",
    comment: "Gravei uma aula em vídeo cobrindo o mesmo conteúdo.",
    createdAt: minuto(50),
  },
  {
    _id: "p0",
    content: "d1",
    file: {
      _id: "f0",
      fileKey: "k0",
      originalName: "funcoes-v0.docx",
      tipo: "documento",
    },
    status: 2,
    author: "u-bia",
    authorName: "Bia Lima",
    reviewedBy: "u-eva",
    reviewedByName: "Eva Lima",
    createdAt: minuto(5),
  },
];

const arquivo = { buffer: btoa("PK"), contentType: "application/octet-stream" };

/** O arquivo, as propostas e a timeline vêm da api; aqui são falsos. */
const rotas = (
  opts: {
    eventos?: unknown[];
    propostas?: unknown[];
    timelineFalha?: boolean;
  } = {},
): RotaFalsa[] => [
  { caminho: /\/content\/file\//, resposta: { corpo: arquivo } },
  {
    caminho: /\/content\/[^/]+\/proposals$/,
    resposta: { corpo: opts.propostas ?? [] },
  },
  {
    caminho: /\/content\/[^/]+\/timeline$/,
    resposta: opts.timelineFalha
      ? { status: 502, corpo: { message: "ms-simulado fora do ar" } }
      : { corpo: { eventos: opts.eventos ?? timelineLonga.slice(0, 2) } },
  },
];

const rotasAluno: RotaFalsa[] = [
  {
    caminho: /\/content\/order$/,
    resposta: {
      corpo: [
        {
          id: "c1",
          title: "Aula: vértice e raízes",
          status: 1,
          subject: { name: "Funções" },
          file: { id: "f2", tipo: "video", videoId: VIDEO },
        },
        {
          id: "c2",
          title: "Apostila com exercícios",
          status: 1,
          subject: { name: "Funções" },
          file: { id: "f1", tipo: "documento", originalName: "funcoes.docx" },
        },
      ],
    },
  },
  { caminho: /\/content\/file\//, resposta: { corpo: arquivo } },
];

const modal = (over: object) => () => (
  <DemandaComPermissoes demand={demanda(over)} />
);

/** tickets/048–050: a demanda de conteúdo — envio, validação, histórico e a página do aluno. */
export const vitrineDemandaModal: Vitrine = {
  slug: "demanda-modal",
  titulo: "Demanda de conteúdo",
  arquivo: "src/pages/dashContent/modals/demandaModal/index.tsx",
  estados: [
    {
      slug: "aguardando-envio",
      titulo: "Envio (clique em Vídeo e cole um link)",
      rotas: [],
      render: () => (
        <ShowDemand
          isOpen
          demand={demanda({
            status: 3,
            file: undefined,
            uploadedByName: undefined,
            lastEditedBy: undefined,
            lastEditedByName: undefined,
            lastEditedAt: undefined,
          })}
          handleClose={nada}
          updateStatusDemand={nada}
        />
      ),
    },
    {
      slug: "pendente-documento",
      titulo: "Pendente · documento",
      rotas: rotas(),
      render: modal({ status: StatusEnum.Pending }),
    },
    {
      slug: "pendente-video",
      titulo: "Pendente · vídeo",
      rotas: rotas({ propostas }),
      render: modal({
        status: StatusEnum.Pending,
        file: video,
        uploadedByName: "Dani Reis",
        lastEditedBy: "u-dani",
        lastEditedByName: "Dani Reis",
      }),
    },
    {
      slug: "aprovada",
      titulo: "Aprovada (com aprovador)",
      rotas: rotas({ eventos: timelineLonga.slice(0, 6) }),
      render: modal({
        status: StatusEnum.Approved,
        approvedBy: "u-bruno",
        approvedByName: "Bruno Costa",
        approvedAt: "2026-09-05T12:00:00Z",
      }),
    },
    {
      slug: "rejeitada",
      titulo: "Rejeitada, com motivo",
      rotas: rotas({ eventos: timelineLonga.slice(0, 3) }),
      render: modal({
        status: StatusEnum.Rejected,
        rejectionReason:
          "Faltou a lista de exercícios e o gabarito. A seção de gráfico está com a figura cortada; refazer a imagem em resolução maior e conferir o vértice no exemplo 3.",
      }),
    },
    {
      slug: "historico-longo",
      titulo: "Histórico longo (12 eventos, 5 pessoas)",
      rotas: rotas({ eventos: timelineLonga, propostas }),
      render: modal({
        status: StatusEnum.Approved,
        file: video,
        uploadedByName: "Dani Reis",
        approvedBy: "u-bruno",
        approvedByName: "Bruno Costa",
        approvedAt: "2026-09-05T12:00:00Z",
      }),
    },
    {
      slug: "historico-com-erro",
      titulo: "Histórico com erro (ms fora)",
      rotas: rotas({ timelineFalha: true }),
      render: modal({ status: StatusEnum.Pending }),
    },
    {
      slug: "nomes-longos",
      titulo: "Nomes longos",
      rotas: rotas(),
      render: modal({
        status: StatusEnum.Approved,
        createdByName: LONGO,
        uploadedByName: LONGO,
        approvedBy: "u-x",
        approvedByName: LONGO,
        approvedAt: "2026-09-05T12:00:00Z",
      }),
    },
    {
      slug: "aluno-lista-mista",
      titulo: "Aluno: tema com vídeo e documento",
      rotas: rotasAluno,
      render: () => <Subject />,
    },
  ],
};
