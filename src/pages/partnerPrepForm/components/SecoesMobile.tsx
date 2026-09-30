import { SectionForm } from "@/types/partnerPrepForm/sectionForm";
import { formatDate } from "@/utils/date";
import { Chip } from "@mui/material";
import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { StatusBadge } from "..";
import { ActionMenu } from "./actionMenu";
import {
  ExpandableSectionProps,
  useQuestoesDaSecao,
} from "./expandableSection";
import { RenderQuestionsTable } from "./renderQuestionsTable";

type Props = Omit<ExpandableSectionProps, "section"> & {
  secoes: SectionForm[];
  /** A tela passa o id; o desktop recebe um callback por linha. */
  handleEditSection: (id: string) => void;
};

/**
 * As seções no celular: a tabela de 7 colunas deixava as ações ~250–425px
 * fora da tela, e ao expandir as questões a tabela crescia para ~965px. Aqui
 * cada seção é um card; as questões abrem nele, como cards também.
 */
export function SecoesMobile({ secoes, ...acoes }: Props) {
  return (
    <ul className="flex flex-col gap-3 px-4 pb-4">
      {secoes.map((secao) => (
        <SecaoCard key={secao._id} section={secao} {...acoes} />
      ))}
    </ul>
  );
}

function SecaoCard({
  section,
  allQuestions = [],
  setSection,
  handleAddQuestion,
  handleEditSection,
  handleDeleteSection,
  handleToggleSection,
  handleReorderQuestions,
  handleDuplicateSection,
  deleteFn,
  toggleActiveFn,
  updateQuestionFn,
}: Omit<Props, "secoes"> & { section: SectionForm }) {
  const [aberto, setAberto] = useState(false);
  const { onDeleteQuestion, onChangeQuestion } = useQuestoesDaSecao(
    section,
    setSection,
    () => setAberto(false),
  );
  const total = section.questions.length;
  const ativas = section.questions.filter((q) => q.active).length;

  return (
    <li
      className={`bg-white border border-gray-200 border-l-4 rounded-lg p-3 flex flex-col gap-2 ${
        section.isGlobal
          ? "border-l-sky-600"
          : section.active
            ? "border-l-marine"
            : "border-l-gray-300 opacity-70"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-bold text-gray-900 break-words min-w-0">
          {section.name}
        </p>
        <StatusBadge active={section.active} />
        {section.isGlobal && (
          <Chip label="Global" size="small" color="info" />
        )}
      </div>
      <p className="text-xs text-gray-600">
        {total} {total === 1 ? "questão" : "questões"} · {ativas} ativas ·
        atualizada em {formatDate(section.updatedAt.toString(), "dd/MM/yyyy")}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2">
        {total > 0 ? (
          <button
            type="button"
            onClick={() => setAberto(!aberto)}
            aria-expanded={aberto}
            className="flex items-center gap-1 h-10 text-sm font-medium text-marine"
          >
            <FiChevronDown
              className={`w-5 h-5 transition-transform ${aberto ? "rotate-180" : ""}`}
            />
            Ver questões
          </button>
        ) : (
          <span className="text-sm text-gray-500">Sem questões</span>
        )}
        {section.isGlobal ? (
          <span className="text-xs text-gray-500">Somente leitura</span>
        ) : (
          <ActionMenu
            tamanho="medium"
            onAdd={() => handleAddQuestion(section._id)}
            onEdit={() => handleEditSection(section._id)}
            onDuplicate={() => handleDuplicateSection(section._id)}
            onDelete={
              total > 0 ? undefined : () => handleDeleteSection(section._id)
            }
            onToggle={() => handleToggleSection(section._id)}
            isActive={section.active}
            mensagemExclusao={`Excluir a seção ${section.name}?`}
          />
        )}
      </div>

      {aberto && (
        <RenderQuestionsTable
          questions={section.questions}
          allQuestions={allQuestions}
          onDeleteQuestion={onDeleteQuestion}
          onChangeQuestion={onChangeQuestion}
          onReorderQuestions={(reordenadas) =>
            handleReorderQuestions(section._id, reordenadas)
          }
          deleteFn={deleteFn}
          toggleActiveFn={toggleActiveFn}
          updateQuestionFn={updateQuestionFn}
          readOnly={section.isGlobal}
        />
      )}
    </li>
  );
}
