import { AttendanceHistoryModal } from "@/pages/partnerClassWithStudents/modals/attendanceHistoryModal";
import { RotaFalsa } from "../fetchFalso";
import { Vitrine } from "../tipos";

const QUEM = ["Fernando Almeida Pinto", "Cleyton Biffe", "Maria Eduarda Albuquerque Nascimento"];
const PERIODOS = ["NOITE", "NOITE", "MANHA", "TARDE"];

/** `n` chamadas, uma por dia útil para trás a partir de hoje. */
function chamadas(n: number) {
  const dia = new Date();
  return Array.from({ length: n }, (_, i) => {
    do dia.setDate(dia.getDate() - 1);
    while (dia.getDay() === 0 || dia.getDay() === 6);
    return {
      id: `chamada-${i + 1}`,
      registeredAt: new Date(dia).toISOString(),
      createdAt: new Date(dia).toISOString(),
      updatedAt: new Date(dia).toISOString(),
      period: PERIODOS[i % PERIODOS.length],
      // Formato da api; o serviço junta em "Nome Sobrenome".
      registeredBy: {
        user: {
          firstName: QUEM[i % QUEM.length].split(" ")[0],
          lastName: QUEM[i % QUEM.length].split(" ").slice(1).join(" "),
        },
      },
    };
  });
}

const historico = (lista: ReturnType<typeof chamadas>): RotaFalsa[] => [
  {
    caminho: /\/attendance-record$/,
    resposta: (url) => {
      const page = Number(url.searchParams.get("page") ?? 1);
      const limit = Number(url.searchParams.get("limit") ?? 10);
      return {
        atraso: 300,
        corpo: {
          data: lista.slice((page - 1) * limit, page * limit),
          totalItems: lista.length,
        },
      };
    },
  },
];

const modal = () => (
  <AttendanceHistoryModal
    isOpen
    handleClose={() => {}}
    classId="turma-vitrine"
    turmaNome="Turma Noite 2026"
  />
);

export const vitrineHistoricoDeChamadas: Vitrine = {
  slug: "historico-de-chamadas",
  titulo: "Frequência da turma (histórico de chamadas)",
  arquivo: "src/pages/partnerClassWithStudents/modals/attendanceHistoryModal.tsx",
  estados: [
    { slug: "varias-paginas", titulo: "24 chamadas", rotas: historico(chamadas(24)), render: modal },
    { slug: "poucas", titulo: "3 chamadas", rotas: historico(chamadas(3)), render: modal },
    { slug: "vazio", titulo: "Nenhuma chamada", rotas: historico([]), render: modal },
    {
      slug: "erro",
      titulo: "Falha ao carregar",
      rotas: [{ caminho: /\/attendance-record$/, resposta: { status: 500, corpo: { message: "Erro" } } }],
      render: modal,
    },
    {
      slug: "carregando",
      titulo: "Carregando",
      rotas: [{ caminho: /\/attendance-record$/, resposta: { atraso: Infinity } }],
      render: modal,
    },
  ],
};
