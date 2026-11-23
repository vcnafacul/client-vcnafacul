import { Roles } from "@/enums/roles/roles";
import { useToastAsync } from "@/hooks/useToastAsync";
import { DASH, PARTNER_CLASS } from "@/routes/path";
import { deleteClass } from "@/services/prepCourse/class/deleteClass";
import { useAuthStore } from "@/store/auth";
import { ClassEntity } from "@/types/partnerPrepCourse/classEntity";
import { useNavigate } from "react-router-dom";

/**
 * Ver, excluir e a regra de quando excluir aparece — compartilhados pela
 * tabela (desktop) e pelos cards do celular (`PeriodosMobile`).
 */
export function useAcoesDaTurma(onDeleteClass: (classId: string) => void) {
  const navigate = useNavigate();

  const {
    data: { token, permissao },
  } = useAuthStore();

  const executeAsync = useToastAsync();

  const handleViewClass = (classItem: ClassEntity) => {
    const url = `${DASH}/${PARTNER_CLASS}/${classItem.id}`;
    navigate(url);
  };

  const handleDeleteClass = async (classItem: ClassEntity) => {
    await executeAsync({
      action: () => deleteClass(token, classItem.id),
      loadingMessage: "Excluindo turma...",
      successMessage: "Turma excluída com sucesso!",
      errorMessage: "Erro ao excluir turma",
      onSuccess: () => {
        onDeleteClass(classItem.id);
      },
    });
  };

  // Estava invertida: escondia só de quem TINHA a permissão e a turma tinha
  // alunos — quem só visualiza via o excluir sempre (e levava 403).
  const podeExcluir = (classItem: ClassEntity) =>
    !!permissao[Roles.gerenciarTurmas] && classItem.number_students === 0;

  return { handleViewClass, handleDeleteClass, podeExcluir };
}
