// Função para renderizar tabela das classes dentro de um período letivo

import { Roles } from "@/enums/roles/roles";
import { useToastAsync } from "@/hooks/useToastAsync";
import { DASH, PARTNER_CLASS } from "@/routes/path";
import { deleteClass } from "@/services/prepCourse/class/deleteClass";
import { useAuthStore } from "@/store/auth";
import { ClassEntity } from "@/types/partnerPrepCourse/classEntity";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
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
      <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
        <Table aria-label="turmas" size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "grey.50" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Nome</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Descrição</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Inscritos
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes.map((classItem) => (
              <TableRow
                key={classItem.id}
                sx={{
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <TableCell sx={{ maxWidth: 100 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {classItem.name}
                  </Typography>
                </TableCell>
                <TableCell sx={{ maxWidth: 200 }}>
                  {classItem.description ? (
                    <Typography variant="body2" color="text.secondary">
                      {classItem.description.length > 100
                        ? `${classItem.description.slice(0, 100)}...`
                        : classItem.description}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Typography
                    variant="body2"
                    fontWeight="medium"
                    color="primary.main"
                  >
                    {classItem.number_students}
                  </Typography>
                </TableCell>
                <TableCell align="right" className="w-10">
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
      </TableContainer>
    </>
  );
}
