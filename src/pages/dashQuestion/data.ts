import { StatusEnum } from "../../enums/generic/statusEnum";

export const dashQuest = {
  title: "Banco de questao",
  options: [
    { name: "Status", id: StatusEnum.All },
    { name: "Pendente", id: StatusEnum.Pending },
    { name: "Aprovado", id: StatusEnum.Approved },
    { name: "Reprovado", id: StatusEnum.Rejected },
  ],
};

export enum Order {
  Increasing = 0,
  Decreasing,
}

export const filters = [
  { name: "Crescente", id: Order.Increasing },
  { name: "Decrescente", id: Order.Decreasing },
];

export const questionInfo = {
  prova: {
    id: "prova",
    type: "select",
    label: "Prova:*",
  },
  ano: {
    id: "ano",
    type: "number",
    label: "Ano:*",
  },
  edicao: {
    id: "edicao",
    type: "text",
    label: "Edição:*",
  },
  numero: {
    id: "numero",
    type: "select",
    label: "Número da Questão:*",
  },
  enemArea: {
    id: "enemArea",
    type: "select",
    label: "Área do Conhecimento:*",
  },
  materia: {
    id: "materia",
    type: "select",
    label: "Disciplina:*",
  },
  frente1: {
    id: "frente1",
    type: "select",
    label: "Frente Principal:*",
  },
  frente2: {
    id: "frente2",
    type: "select",
    label: "Frente Secundária",
  },
  frente3: {
    id: "frente3",
    type: "select",
    label: "Frente Terciária",
  },
};

export type QuestionInfoType = typeof questionInfo;

export const questionContent = {
  textoQuestao: {
    id: "textoQuestao",
    type: "textarea",
    label: "Texto da questão:*",
  },
  textoAlternativaA: {
    id: "textoAlternativaA",
    type: "text",
    label: "Alternativa A:",
  },
  textoAlternativaB: {
    id: "textoAlternativaB",
    type: "text",
    label: "Alternativa B:",
  },
  textoAlternativaC: {
    id: "textoAlternativaC",
    type: "text",
    label: "Alternativa C:",
  },
  textoAlternativaD: {
    id: "textoAlternativaD",
    type: "text",
    label: "Alternativa D:",
  },
  textoAlternativaE: {
    id: "textoAlternativaE",
    type: "text",
    label: "Alternativa E:",
  },
};

export type QuestionContentType = typeof questionContent;