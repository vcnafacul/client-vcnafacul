import { CoursePeriodEntity } from "@/services/prepCourse/coursePeriod/createCoursePeriod";
import { formatDate } from "@/utils/date";
import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { ActionMenu } from "./actionMenu";
import { useAcoesDaTurma } from "./renderClassesTable";
import { StatusBadge } from "./statusBadge";

interface Props {
  periodos: CoursePeriodEntity[];
  setCoursePeriod: (coursePeriod: CoursePeriodEntity) => void;
  handleAddClass: (coursePeriodId: string) => void;
  handleEditClass: (classId: string) => void;
  handleEditCoursePeriod: (coursePeriodId: string) => void;
  handleDeleteCoursePeriod: (coursePeriodId: string) => void;
}

const data = (d: Date | string) => formatDate(d.toString(), "dd/MM/yyyy");

/**
 * Os períodos letivos no celular: a tabela de 7 colunas deixava as ações —
 * e o olho que leva à turma — ~350px fora da tela. Aqui cada período é um
 * card, e as turmas abrem logo abaixo, com as mesmas ações.
 */
export function PeriodosMobile({ periodos, ...acoes }: Props) {
  return (
    <ul className="flex flex-col gap-3 px-4 pb-4">
      {periodos.map((periodo) => (
        <PeriodoCard key={periodo.id} periodo={periodo} {...acoes} />
      ))}
    </ul>
  );
}

function PeriodoCard({
  periodo,
  setCoursePeriod,
  handleAddClass,
  handleEditClass,
  handleEditCoursePeriod,
  handleDeleteCoursePeriod,
}: Omit<Props, "periodos"> & { periodo: CoursePeriodEntity }) {
  const [aberto, setAberto] = useState(false);
  const turmas = periodo.classes;

  // Mesma atualização do ExpandableCoursePeriod (desktop).
  const onDeleteClass = (classId: string) => {
    const restantes = turmas.filter((c) => c.id !== classId);
    setCoursePeriod({
      ...periodo,
      classes: restantes,
      classesCount: restantes.length,
    });
    if (restantes.length === 0) setAberto(false);
  };
  const { handleViewClass, handleDeleteClass, podeExcluir } =
    useAcoesDaTurma(onDeleteClass);

  return (
    <li className="bg-white border border-gray-200 border-l-4 border-l-marine rounded-lg p-3 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold text-gray-900 break-words">{periodo.name}</p>
          <p className="text-xs text-gray-600">
            {periodo.year} · {data(periodo.startDate)} a {data(periodo.endDate)}
          </p>
        </div>
        <StatusBadge active={new Date(periodo.endDate) >= new Date()} />
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
        {turmas.length > 0 ? (
          <button
            type="button"
            onClick={() => setAberto(!aberto)}
            aria-expanded={aberto}
            className="flex items-center gap-1 h-10 text-sm font-medium text-marine"
          >
            <FiChevronDown
              className={`w-5 h-5 transition-transform ${aberto ? "rotate-180" : ""}`}
            />
            {turmas.length} {turmas.length === 1 ? "turma" : "turmas"}
          </button>
        ) : (
          <span className="text-sm text-gray-500">Sem turmas</span>
        )}
        <div className="shrink-0">
          <ActionMenu
            tamanho="medium"
            onAdd={() => handleAddClass(periodo.id)}
            onEdit={() => handleEditCoursePeriod(periodo.id)}
            onDelete={
              turmas.length > 0
                ? undefined
                : () => handleDeleteCoursePeriod(periodo.id)
            }
            mensagemExclusao={`Excluir o período ${periodo.name}?`}
          />
        </div>
      </div>

      {aberto && (
        <ul className="flex flex-col gap-2">
          {turmas.map((turma) => (
            <li
              key={turma.id}
              className="bg-gray-50 rounded-md p-2 flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold break-words">
                  {turma.name}
                </p>
                {turma.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 break-words">
                    {turma.description}
                  </p>
                )}
                <p className="text-xs text-marine font-medium">
                  {turma.number_students} inscritos
                </p>
              </div>
              <div className="shrink-0">
                <ActionMenu
                  tamanho="medium"
                  onView={() => handleViewClass(turma)}
                  onEdit={() => handleEditClass(turma.id)}
                  onDelete={
                    podeExcluir(turma)
                      ? () => handleDeleteClass(turma)
                      : undefined
                  }
                  mensagemExclusao={`Excluir a turma ${turma.name}?`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
