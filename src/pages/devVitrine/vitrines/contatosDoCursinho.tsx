import { prepCourseInfo } from "@/pages/dashGeo/data";
import { PrepCourseInfo } from "@/pages/dashGeo/modals/modalEditDashGeo/Fields/prepCourseInfo";
import { Geolocation } from "@/types/geolocation/geolocation";
import { TypeMarker } from "@/types/map/marker";
import { Vitrine } from "../tipos";

/**
 * Dados do cursinho no modal do Localiza Cursinho (dashGeo): na visualização,
 * os contatos preenchidos ganham um botão de copiar.
 */
const cheio = {
  id: "1",
  name: "Cursinho Popular Semear",
  type: TypeMarker.geo,
  category: "Cursinho popular",
  cep: "01310-100",
  street: "Avenida Paulista",
  number: "1000",
  neighborhood: "Bela Vista",
  city: "São Paulo",
  state: "SP",
  phone: "1133334444",
  whatsapp: "11999998888",
  email: "contato@cursinhopopularsemear.org.br",
  site: "https://www.cursinhopopularsemear.org.br/inscricoes-2027/primeiro-semestre",
  instagram: "@cursinhosemear",
  youtube: "https://youtube.com/@cursinhosemear",
  facebook: "facebook.com/cursinhosemear",
  linkedin: "",
  twitter: "",
  tiktok: "@cursinhosemear",
} as unknown as Geolocation;

const vazio = {
  ...cheio,
  phone: "",
  whatsapp: "",
  site: "",
  instagram: "",
  youtube: "",
  facebook: "",
  tiktok: "",
} as Geolocation;

const props = { form: prepCourseInfo, setValue: () => {}, errors: {} };

export const vitrineContatosDoCursinho: Vitrine = {
  slug: "contatos-do-cursinho",
  titulo: "Contatos do cursinho (dashGeo)",
  arquivo:
    "src/pages/dashGeo/modals/modalEditDashGeo/Fields/prepCourseInfo.tsx",
  estados: [
    {
      slug: "visualizacao",
      titulo: "Visualização",
      render: () => <PrepCourseInfo {...props} edit={false} geo={cheio} />,
    },
    {
      slug: "sem-contatos",
      titulo: "Sem redes",
      render: () => <PrepCourseInfo {...props} edit={false} geo={vazio} />,
    },
    {
      slug: "edicao",
      titulo: "Edição",
      render: () => <PrepCourseInfo {...props} edit geo={cheio} />,
    },
  ],
};
