// Função para renderizar tabela das classes dentro de um período letivo

import { Roles } from "@/enums/roles/roles";
import { useToastAsync } from "@/hooks/useToastAsync";
import { DASH, PARTNER_CLASS } from "@/routes/path";
import { deleteClass } from "@/services/prepCourse/class/deleteClass";
import { useAuthStore } from "@/store/auth";
import { ClassEntity } from "@/types/partnerPrepCourse/classEntity";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { ActionMenu } from "./actionMenu";

interface RenderClassesTableProps {
  classes: ClassEntity[];
  onDeleteClass: (classId: string) => void;
  handleEditClass: (classId: string) => void;
  podeGerenciar: boolean;
}

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

export function RenderClassesTable({
  classes,
  onDeleteClass,
  handleEditClass,
  podeGerenciar,
}: RenderClassesTableProps) {
  const { handleViewClass, handleDeleteClass, podeExcluir } =
    useAcoesDaTurma(onDeleteClass);

  return (
    <>
      <Card>
        <Table aria-label="turmas">
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-center">Inscritos</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((classItem) => (
              <TableRow key={classItem.id}>
                <TableCell className="max-w-[100px]">
                  <span className="text-body font-medium">{classItem.name}</span>
                </TableCell>
                <TableCell className="max-w-[200px] text-muted-foreground">
                  {classItem.description
                    ? classItem.description.length > 100
                      ? `${classItem.description.slice(0, 100)}...`
                      : classItem.description
                    : "-"}
                </TableCell>
                <TableCell className="text-center font-medium text-primary">
                  {classItem.number_students}
                </TableCell>
                <TableCell className="w-10 text-right">
                  <ActionMenu
                    onView={() => handleViewClass(classItem)}
                    onEdit={
                      podeGerenciar
                        ? () => handleEditClass(classItem.id)
                        : undefined
                    }
                    onDelete={
                      podeExcluir(classItem)
                        ? () => handleDeleteClass(classItem)
                        : undefined
                    }
                    mensagemExclusao={`Excluir a turma ${classItem.name}?`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}
