import { AlertaEvasaoModal } from "@/pages/partnerClass/alertaEvasao/alertaEvasaoModal";
import { RotaFalsa } from "../fetchFalso";
import { Vitrine } from "../tipos";

const com = (percentual: number | null, minimoDeAulas = 10): RotaFalsa[] => [
  {
    caminho: /\/partner-prep-course\/alerta-evasao$/,
    resposta: { atraso: 200, corpo: { percentual, minimoDeAulas } },
  },
  {
    metodo: "PATCH",
    caminho: /\/partner-prep-course\/alerta-evasao$/,
    resposta: (_url, init) => ({ atraso: 600, corpo: JSON.parse(String(init?.body)) }),
  },
];

const modal = () => <AlertaEvasaoModal isOpen handleClose={() => {}} />;

export const vitrineAlertaEvasao: Vitrine = {
  slug: "alerta-evasao",
  titulo: "Alerta de risco de evasão (configuração do cursinho)",
  arquivo: "src/pages/partnerClass/alertaEvasao/alertaEvasaoModal.tsx",
  estados: [
    { slug: "desligado", titulo: "Nunca configurado", rotas: com(null), render: modal },
    { slug: "configurado", titulo: "15% após 10 aulas", rotas: com(15, 10), render: modal },
    {
      slug: "erro",
      titulo: "Falha ao carregar",
      rotas: [
        {
          caminho: /\/partner-prep-course\/alerta-evasao$/,
          resposta: { status: 500, corpo: { message: "Erro" } },
        },
      ],
      render: modal,
    },
  ],
};
