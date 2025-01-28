import { StatusEnum } from "../../enums/generic/statusEnum";
import { stateOptions } from "../register/data";

export const dashGeo = {
  title: "Validação Localiza Cursinho",
  options: [
    { name: "Pendente", id: StatusEnum.Pending },
    { name: "Aprovado", id: StatusEnum.Approved },
    { name: "Reprovado", id: StatusEnum.Rejected },
  ],
};

export const prepCourseInfo = {
    name: {
        id: "name",
        type: "text",
        label: "Nome do Cursinho",
    },
    category: {
        id: "category",
        type: "text",
        label: "Tipo de Cursinho:",
    },
    campus: {
        id: "campus",
        type: "text",
        label: "Campus:",
    },
    cep: {
        id: "cep",
        type: "text",
        label: "Cep:",
    },
    street: {
        id: "street",
        type: "text",
        label: "Logradouro",
    },
    number: {
        id: "number",
        type: "text",
        label: "Numero",
    },
    complement: {
        id: "complement",
        type: "text",
        label: "Complemento",
    },
    neighborhood: {
        id: "neighborhood",
        type: "text",
        label: "Bairro",
    },
    city: {
        id: "city",
        type: "text",
        label: "Municipio",
    },
    state: {
        id: "state",
        type: "select",
        label: "Estado",
        options: stateOptions,
    },
    phone: {
        id: "phone",
        type: "text",
        label: "Telefone",
    },
    whatsapp: {
        id: "whatsapp",
        type: "text",
        label: "Whatsapp",
    },
    email: {
        id: "email",
        type: "text",
        label: "Email",
    },
    site: {
        id: "site",
        type: "text",
        label: "Site",
    },
    instagram: {
        id: "instagram",
        type: "text",
        label: "Instagram",
    },
    youtube: {
        id: "youtube",
        type: "text",
        label: "Youtube",
    },
    facebook: {
        id: "facebook",
        type: "text",
        label: "Facebook",
    },
    linkedin: {
        id: "linkedin",
        type: "text",
        label: "Linkedin",
    },
    twitter: {
        id: "twitter",
        type: "text",
        label: "Twitter",
    },
    tiktok: {
        id: "tiktok",
        type: "text",
        label: "Tiktok",
    },
}

export type prepCourseInfoType = typeof prepCourseInfo;

export const prepCourseRegistred = {
    userFullname: {
        id: "userFullName",
        type: "text",
        label: "Nome Completo",
    },
    userEmail: {
        id: "userEmail",
        type: "text",
        label: "Email",
    },
    userPhone: {
        id: "userPhone",
        type: "text",
        label: "Celular/Whatsapp",
    },
    userConnection: {
        id: "userConnection",
        type: "text",
        label: "Relação com o Cursinho",
    },
    createdAt: {
        id: "createdAt",
        type: "text",
        label: "Cadastrado em",
    },
}

export type prepCourseRegistredType = typeof prepCourseRegistred;

export const prepCourseUpdated = {
    userFullname: {
        id: "userFullname",
        type: "text",
        label: "Nome Completo",
    },
    userEmail: {
        id: "userEmail",
        type: "text",
        label: "Email",
    },
    userPhone: {
        id: "userPhone",
        type: "text",
        label: "Telefone",
    },
}

export type prepCourseUpdatedType = typeof prepCourseUpdated;