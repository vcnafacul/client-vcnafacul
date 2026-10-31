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

/** Hoje em `YYYY-MM-DD`, para a justificativa por período cobrir a chamada. */
function hoje() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * Risco de evasão (tickets/054): 40 aulas por aluno e faltas variadas — uns
 * já acima de 15%, uns no limite, o 3º justificado hoje, o 5º recém-chegado.
 */
function comFaltas(lista: ReturnType<typeof alunos>) {
  const faltas = [8, 1, 5, 0, 6, 2, 9, 0, 3, 7, 0, 4];
  return lista.map((a, i) => ({
    ...a,
    aulas: i === 4 ? 3 : 40,
    faltasNaoJustificadas: i === 4 ? 2 : faltas[i % faltas.length],
    justificativasPorPeriodo: i === 2 ? [{ inicio: hoje(), fim: hoje() }] : [],
  }));
}

const turma = (
  students: ReturnType<typeof alunos>,
  alertaEvasao: { percentual: number; minimoDeAulas: number } | null = null,
): RotaFalsa[] => [
  {
    caminho: /\/class\/[^/]+\/attendance-record$/,
    resposta: {
      corpo: { id: "turma-vitrine", name: "Turma A", year: 2026, alertaEvasao, students },
    },
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
    {
      slug: "com-risco",
      titulo: "Risco de evasão (alerta 15%)",
      rotas: turma(comFaltas(alunos(30, 3)), { percentual: 15, minimoDeAulas: 10 }),
      render: modal,
    },
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
