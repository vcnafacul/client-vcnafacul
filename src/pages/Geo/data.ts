import { FormFieldOption } from "../../components/molecules/formField";
import { GeoFormProps } from "../../components/organisms/geoForm";
import { stateOptions } from "../register/data";

export const occupation: FormFieldOption[] = [
  { value: 'Coordenador', label: 'Coordenador'},
  { value: 'Professor', label: 'Professor'},
  { value: 'Colaborador', label: 'Colaborador'},
  { value: 'Aluno', label: 'Aluno'},
  { value: 'Outros', label: 'Outros'},
]

export const courseType: FormFieldOption[] = [
  { value: 'Gratuito', label: 'Gratuito'},
  { value: 'Sem fins lucrativos', label: 'Sem fins lucrativos'},
  { value: 'Outros', label: 'Outros...'},
]

export const geoForm : GeoFormProps = {
  formData: {
      step1 : {
        title: 'Dados Pessoais',
        subtitle: 'Nos conte um pouco sobre você e sua relação com o cursinho que está cadastrando',
        form: [
          {id: "userFullName", label: "Nome Completo"},
          {id: 'userEmail', label: 'E-mail', type: 'email'},
          {id: "userPhone", label: "Telefone"},
          {id: "userConnection", label: "Relaçao com o cursinho cadastrado:*",  type: 'option', options: occupation},
        ]
      },
      step2 : {
        title: 'Dados do Cursinho',
        subtitle: 'Precisamos saber o maior número de informações possível sobre este cursinho.',
        form: [
          {id: "name", label: "Nome do cursinho*"},
          {id: "category", label: "Tipo de cursinho*",  type: 'option', options: courseType},
        ]
      },
      step3 : {
        title: 'Endereço do Cursinho',
        subtitle: 'Precisamos saber o maior número de informações possível sobre este cursinho.',
        form: [
          {id: "cep", label: "CEP*", disabled: true},
          {id: "street", label: "Logradouro*",  disabled: true},
          {id: "number", label: "Número*"},
          {id: "complement", label: "Complemento"},
          {id: "neighborhood", label: "Bairro*",  disabled: true},
          {id: "city", label: "Município*",  disabled: true},
          {id: "state", label: "Estado*", type: 'option',  options: stateOptions,  disabled: true},
        ]
      },
      step4 : {
        title: 'Contatos do Cursinho',
        subtitle: 'Precisamos saber o maior número de informações possível sobre este cursinho.',
        form: [
          {id: "phone", label: "Telefone"},
          {id: "whatsapp", label: "Whatsapp"},
          {id: "email", label: "E-mail*"},
        ]
      },
      step5 : {
        title: 'Canais digitais de contato',
        subtitle: 'Gostariamos de saber em quais redes sociais o cursinho já é divulgado. Você poderia colocar o link?',
        form: [
          {id: "site", label: "Site"},
          {id: "instagram", label: "Instagram"},
          {id: "youtube", label: "Youtube"},
          {id: "facebook", label: "Facebook"},
          {id: "linkedin", label: "LinkedIn"},
          {id: "twitter", label: "Twitter"},
          {id: "tiktok", label: "Tiktok"},
        ]
      },
      step6 : {
        title: 'O cadastro do cursinho foi realizado com sucesso!',
        subtitle: 'Nossa equipe estará verificando as informações e liberando o cadastro para aparecer no mapa. Em caso de dúvidas entraremos em contato pelos canais que disponibilizou no começo do formulário.',
        form: []
      },
  }
}