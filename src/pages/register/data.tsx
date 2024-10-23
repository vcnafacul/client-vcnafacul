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
  formData: {
    step1: [
      { id: "email", label: "E-mail" },
      { id: "password", label: "Senha", type: "password" },
      {
        id: "password_confirmation",
        label: "Confirmar Senha",
        type: "password",
      },
    ],
    step2: [
      { id: "firstName", label: "Nome" },
      { id: "lastName", label: "Sobrenome" },
      { id: "gender", label: "Gênero", type: "option", options: optionsGender },
      {
        id: "birthday",
        type: "date",
        label: "Data de Nascimento",
        defaultValue: "01/01/2022",
      },
      { id: "phone", label: "Telefone" },
      { id: "state", label: "Estado", type: "option", options: stateOptions },
      { id: "city", label: "Cidade" },
    ],
  },
};

export const uppercaseLetterRegex = /[A-Z]/;
export const lowercaseLetterRegex = /[a-z]/;
export const specialCaracteresRegex = /[!@#$%^&*(),.?":{}|<>]/;
