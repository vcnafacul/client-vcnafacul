// Função para renderizar tabela das classes dentro de um período letivo

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
import { ActionMenu } from "./actionMenu";
import { useAcoesDaTurma } from "./useAcoesDaTurma";

interface RenderClassesTableProps {
  classes: ClassEntity[];
  onDeleteClass: (classId: string) => void;
  handleEditClass: (classId: string) => void;
  podeGerenciar: boolean;
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
