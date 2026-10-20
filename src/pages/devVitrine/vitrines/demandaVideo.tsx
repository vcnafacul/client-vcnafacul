import type { ContentDtoInput } from "@/dtos/content/contentDtoInput";
import { StatusEnum } from "@/enums/generic/statusEnum";
import ShowDemand from "@/pages/dashContent/modals/showDemand";
import Subject from "@/pages/subject";
import { RotaFalsa } from "../fetchFalso";
import { Vitrine } from "../tipos";
import { DemandaComPermissoes } from "./DemandaComPermissoes";

const nada = () => {};
const VIDEO = "dQw4w9WgXcQ";

const base = {
  id: "d1",
  title: "Funções do 2º grau: vértice, raízes e gráfico",
  description:
    "Material completo com teoria, exemplos resolvidos e uma lista de 20 exercícios com gabarito.",
  createdAt: "2026-09-01T12:00:00Z",
  userId: "u-criador",
  createdByName: "Carla Mendes",
  subject: { id: "s1", name: "Funções", frente: { nome: "Álgebra", materia: "m1" } },
};

const aguardandoEnvio = { ...base, status: 3 } as unknown as ContentDtoInput;

const pendenteEmVideo = {
  ...base,
  status: StatusEnum.Pending,
  file: { id: "f1", originalName: "", uploadedBy: "u-autor", tipo: "video", videoId: VIDEO },
  uploadedByName: "Ana Souza",
  lastEditedBy: "u-autor",
  lastEditedByName: "Ana Souza",
  lastEditedAt: "2026-09-02T12:00:00Z",
} as unknown as ContentDtoInput;

const arquivo = { buffer: btoa("PK"), contentType: "application/octet-stream" };

/** Propostas e histórico misturando documento e vídeo. */
const rotasValidacao: RotaFalsa[] = [
  { caminho: /\/content\/file\//, resposta: { corpo: arquivo } },
  {
    caminho: /\/content\/[^/]+\/proposals$/,
    resposta: {
      corpo: [
        {
          _id: "p1",
          content: "d1",
          file: { _id: "f2", fileKey: "k2", originalName: "funcoes-v2.docx", tipo: "documento" },
          status: 0,
          author: "u-bia",
          authorName: "Bia Lima",
          comment: "Troquei o vídeo por uma apostila com os exercícios.",
          createdAt: "2026-09-03T12:00:00Z",
        },
      ],
    },
  },
  {
    caminho: /\/content\/[^/]+\/file-history$/,
    resposta: {
      corpo: [
        {
          _id: "h2",
          content: "d1",
          file: { _id: "f1", tipo: "video", videoId: VIDEO },
          uploadedBy: "u-autor",
          uploadedByName: "Ana Souza",
          source: "proposal_approved",
          createdAt: "2026-09-02T12:00:00Z",
        },
        {
          _id: "h1",
          content: "d1",
          file: { _id: "f0", fileKey: "k0", originalName: "funcoes-v1.docx", tipo: "documento" },
          uploadedBy: "u-criador",
          uploadedByName: "Carla Mendes",
          source: "initial_upload",
          createdAt: "2026-09-01T12:00:00Z",
        },
      ],
    },
  },
];

/** Página do tema do aluno: um vídeo e um documento aprovados. */
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
          file: { id: "f1", tipo: "video", videoId: VIDEO },
        },
        {
          id: "c2",
          title: "Apostila com exercícios",
          status: 1,
          subject: { name: "Funções" },
          file: { id: "f2", tipo: "documento", originalName: "funcoes.docx" },
        },
      ],
    },
  },
  { caminho: /\/content\/file\//, resposta: { corpo: arquivo } },
];

/** tickets/049: lição em vídeo — envio, validação e página do tema. */
export const vitrineDemandaVideo: Vitrine = {
  slug: "demanda-video",
  titulo: "Conteúdo em vídeo",
  arquivo: "src/pages/dashContent/modals/showDemand.tsx",
  estados: [
    {
      slug: "envio",
      titulo: "Envio (clique em Vídeo e cole um link)",
      rotas: [],
      render: () => (
        <ShowDemand isOpen demand={aguardandoEnvio} handleClose={nada} updateStatusDemand={nada} />
      ),
    },
    {
      slug: "validacao-video",
      titulo: "Validação com vídeo pendente",
      rotas: rotasValidacao,
      render: () => <DemandaComPermissoes demand={pendenteEmVideo} />,
    },
    {
      slug: "aluno-lista-mista",
      titulo: "Aluno: tema com vídeo e documento",
      rotas: rotasAluno,
      render: () => <Subject />,
    },
  ],
};
