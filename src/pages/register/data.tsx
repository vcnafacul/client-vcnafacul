import { FormFieldOption } from "../../components/molecules/formField";
import { RegisterFormProps } from "../../components/organisms/registerForm";
import { Gender } from "../../store/auth";

export const stateOptions: FormFieldOption[] = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

export const optionsGender: FormFieldOption[] = [
  { value: Gender.Male, label: "Masculino" },
  { value: Gender.Female, label: "Feminino" },
  { value: Gender.Other, label: "Outro" },
];

export const registerForm: RegisterFormProps = {
  title: "Cadastre-se",
  titleSuccess: "Seja bem-vinde ao Você na Facul!",
};

export const uppercaseLetterRegex = /[A-Z]/;
export const lowercaseLetterRegex = /[a-z]/;
export const specialCaracteresRegex = /[!@#$%^&*(),.?":{}|<>]/;

export const textContact: { text: string, email: string, linkToMakeContactOnGmail: string } = {
  text: "Se não encontrar o e-mail de confirmação, verifique a caixa de spam. Caso não tenha recebido, entre em contato pelo e-mail:",
  email: "contato@vcnafacul.com.br",
  linkToMakeContactOnGmail: "https://mail.google.com/mail/?view=cm&fs=1&to=contato@vcnafacul.com.br&su=Não%20recebi%20o%20e-mail%20de%20confirmação&body=Olá,%20não%20recebi%20o%20e-mail%20de%20confirmação.%20Poderiam%20verificar%20por%20favor?"
}

export const socialNameCheckbox =
  "O nome social é destinado a pessoas trans, travestis ou não binárias que preferem ser identificadas por um nome diferente do registrado oficialmente. Ele existe para garantir respeito à identidade de gênero e evitar situações constrangedoras.";

export const linkSocialName =
  "https://www.trf4.jus.br/trf4/controlador.php?acao=pagina_visualizar&id_pagina=2207";
