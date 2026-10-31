import { NewAttendanceRecordModal } from "@/pages/partnerClassWithStudents/modals/newAttendanceRecordModal";
import { RotaFalsa } from "../fetchFalso";
import { Vitrine } from "../tipos";

const PRIMEIROS = ["Ana", "João", "Maria Eduarda", "Pedro", "Larissa", "Kauã", "Ana Clara", "Luiz Fernando"];
const SOBRENOMES = ["Silva", "Santos", "Oliveira", "Ferreira", "Nascimento", "Rodrigues", "Albuquerque"];

function alunos(n: number, sobrenomes = 2) {
  return Array.from({ length: n }, (_, i) => ({
    id: `aluno-${i + 1}`,
    name: [
      PRIMEIROS[i % PRIMEIROS.length],
      ...Array.from({ length: sobrenomes }, (_, j) => SOBRENOMES[(i + j * 3) % SOBRENOMES.length]),
    ].join(" "),
    cod_enrolled: `MAT-${String(i + 1).padStart(3, "0")}`,
  }));
}

const turma = (students: ReturnType<typeof alunos>): RotaFalsa[] => [
  {
    caminho: /\/class\/[^/]+\/attendance-record$/,
    resposta: { corpo: { id: "turma-vitrine", name: "Turma A", year: 2026, students } },
  },
  {
    metodo: "POST",
    caminho: /\/attendance-record$/,
    resposta: {
      atraso: 600,
      corpo: { id: "registro-vitrine", createdAt: new Date(), updatedAt: new Date(), registeredAt: new Date() },
    },
  },
];

const modal = () => (
  <NewAttendanceRecordModal
    isOpen
    handleClose={() => {}}
    classId="turma-vitrine"
    turmaNome="Turma Noite 2026"
    handleNewAttendanceRecord={() => {}}
  />
);

export const vitrineChamada: Vitrine = {
  slug: "chamada",
  titulo: "Novo registro de chamada",
  arquivo: "src/pages/partnerClassWithStudents/modals/newAttendanceRecordModal.tsx",
  estados: [
    { slug: "turma-cheia", titulo: "65 alunos", rotas: turma(alunos(65)), render: modal },
    { slug: "nomes-longos", titulo: "Nomes com 5 sobrenomes", rotas: turma(alunos(12, 5)), render: modal },
    { slug: "vazia", titulo: "Turma sem matriculados", rotas: turma([]), render: modal },
    {
      slug: "carregando",
      titulo: "Lista ainda carregando",
      rotas: [{ caminho: /\/class\/[^/]+\/attendance-record$/, resposta: { atraso: Infinity } }],
      render: modal,
    },
  ],
};
