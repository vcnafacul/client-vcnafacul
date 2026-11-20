import type { SelectOption } from "@/components/ui/options-select";
import { GeoFormProps } from "../../components/organisms/geoForm";
import { stateOptions } from "../register/data";

export const occupation: SelectOption[] = [
  { value: 'Coordenador', label: 'Coordenador'},
  { value: 'Professor', label: 'Professor'},
  { value: 'Colaborador', label: 'Colaborador'},
  { value: 'Aluno', label: 'Aluno'},
  { value: 'Outros', label: 'Outros'},
]

export const courseType: SelectOption[] = [
  { value: 'Gratuito', label: 'Gratuito'},
  { value: 'Sem fins lucrativos', label: 'Sem fins lucrativos'},
  { value: 'Outros', label: 'Outros...'},
]

export const geoForm : GeoFormProps = {
  formData: {
      step1 : {
        title: 'Dados Pessoais',
        subtitle: 'Para terminar, nos conte um pouco sobre você e sua relação com o cursinho que está cadastrando',
        form: [
          {required: true, id: "userFullName", label: "Nome Completo", autoComplete: "name"},
          {required: true, id: 'userEmail', label: 'E-mail', type: 'email', inputMode: 'email', autoComplete: 'email'},
          {required: true, id: "userPhone", label: "Telefone", inputMode: "tel", autoComplete: "tel"},
          {required: true, id: "userConnection", label: "Relaçao com o cursinho cadastrado:",  type: 'select', options: occupation},
        ]
      },
      step2 : {
        title: 'Cadastre um novo cursinho para fazer parte do nosso mapa',
        subtitle: 'Dados do Cursinho: Precisamos saber o maior número de informações possível sobre este cursinho.',
        form: [
          {required: true, id: "name", label: "Nome do cursinho"},
          {required: true, id: "category", label: "Tipo de cursinho",  type: 'select', options: courseType},
        ]
      },
      step3 : {
        title: 'Endereço do Cursinho',
        subtitle: 'Precisamos saber o maior número de informações possível sobre este cursinho.',
        form: [
          {required: true, id: "cep", label: "CEP", inputMode: "numeric", autoComplete: "postal-code"},
          {required: true, id: "street", label: "Logradouro"},
          {required: true, id: "number", label: "Número", inputMode: "numeric"},
          {id: "complement", label: "Complemento"},
          {required: true, id: "neighborhood", label: "Bairro"},
          {required: true, id: "city", label: "Município"},
          {required: true, id: "state", label: "Estado", type: 'select',  options: stateOptions},
        ]
      },
      step4 : {
        title: 'Contatos do Cursinho',
        subtitle: 'Precisamos saber o maior número de informações possível sobre este cursinho.',
        form: [
          {id: "phone", label: "Telefone", inputMode: "tel", autoComplete: "tel"},
          {id: "whatsapp", label: "Whatsapp", inputMode: "tel", autoComplete: "tel"},
          {required: true, id: "email", label: "E-mail", type: "email", inputMode: "email", autoComplete: "email"},
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
        subtitle: 'Nossa equipe estará verificando as informações e liberando o cadastro para aparecer no mapa. Em caso de dúvidas entraremos em contato pelo e-mail ou telefone que você informou.',
        form: []
      },
  }
}