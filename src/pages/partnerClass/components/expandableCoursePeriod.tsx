import { CoursePeriodEntity } from "@/services/prepCourse/coursePeriod/createCoursePeriod";
import { formatDate } from "@/utils/date";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

import { ActionMenu } from "./actionMenu";
import { RenderClassesTable } from "./renderClassesTable";
import { StatusBadge } from "./statusBadge";

interface ExpandableCoursePeriodProps {
  coursePeriod: CoursePeriodEntity;
  setCoursePeriod: (coursePeriod: CoursePeriodEntity) => void;
  handleAddClass: (coursePeriodId: string) => void;
  handleEditClass: (classId: string) => void;
  handleEditCoursePeriod: (coursePeriodId: string) => void;
  handleDeleteCoursePeriod: (coursePeriodId: string) => void;
  /** gerenciarTurmas: sem ela, só o expandir (e o ver turma) aparece. */
  podeGerenciar: boolean;
}

export function ExpandableCoursePeriod({
  coursePeriod,
  setCoursePeriod,
  handleAddClass,
  handleEditClass,
  handleEditCoursePeriod,
  handleDeleteCoursePeriod,
  podeGerenciar,
}: ExpandableCoursePeriodProps) {
  const [open, setOpen] = useState<boolean>(false);
  const idDetalhes = useId();
  const rotulo = open ? "Recolher" : "Expandir";

  const totalClassesCount = coursePeriod.classes.length;

  const onDeleteClass = (classId: string) => {
    const newClasses = coursePeriod.classes.filter((c) => c.id !== classId);
    const updatedCoursePeriod = {
      ...coursePeriod,
      classes: newClasses,
      classesCount: newClasses.length,
    };
    setCoursePeriod(updatedCoursePeriod);
    if (newClasses.length === 0) {
      setOpen(false);
    }
  };

  return (
    <>
      <TableRow
        key={coursePeriod.id}
        data-state={open ? "selected" : undefined}
        className="hover:bg-accent"
      >
        <TableCell className="w-16 border-l-4 border-l-primary">
          {coursePeriod.classes.length > 0 && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`${rotulo} turmas de ${coursePeriod.name}`}
                    aria-expanded={open}
                    aria-controls={open ? idDetalhes : undefined}
                    onClick={() => setOpen(!open)}
                    className="sm:h-8 sm:w-8"
                  >
                    <ChevronDown
                      className={`transition-transform ${open ? "rotate-180" : ""}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{rotulo}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <span className="text-body font-bold">{coursePeriod.name}</span>
            <StatusBadge
              active={new Date(coursePeriod.endDate) >= new Date()}
            />
          </div>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex flex-col items-end">
            <span className="text-body font-bold">{totalClassesCount}</span>
            <span className="text-caption text-muted-foreground">total</span>
          </div>
        </TableCell>
        <TableCell className="text-right">
          <span className="text-body font-bold">{coursePeriod.year}</span>
        </TableCell>
        <TableCell className="text-right">
          <div>{formatDate(coursePeriod.startDate.toString(), "dd/MM/yyyy")}</div>
          <div className="text-caption text-muted-foreground">
            {formatDate(coursePeriod.startDate.toString(), "HH:mm")}
          </div>
        </TableCell>
        <TableCell className="text-right">
          <div>{formatDate(coursePeriod.endDate.toString(), "dd/MM/yyyy")}</div>
          <div className="text-caption text-muted-foreground">
            {formatDate(coursePeriod.endDate.toString(), "HH:mm")}
          </div>
        </TableCell>
        <TableCell className="w-10 text-right">
          <ActionMenu
            onAdd={
              podeGerenciar ? () => handleAddClass(coursePeriod.id) : undefined
            }
            onEdit={
              podeGerenciar
                ? () => handleEditCoursePeriod(coursePeriod.id)
                : undefined
            }
            onDelete={
              podeGerenciar && totalClassesCount === 0
                ? () => handleDeleteCoursePeriod(coursePeriod.id)
                : undefined
            }
            mensagemExclusao={`Excluir o período ${coursePeriod.name}?`}
          />
        </TableCell>
      </TableRow>
      {open && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={8} className="py-0">
            <div id={idDetalhes} className="m-2">
              <h4 className="mb-2 text-h4 font-bold text-primary">
                Turmas ({totalClassesCount})
              </h4>
              <RenderClassesTable
                classes={coursePeriod.classes}
                handleEditClass={handleEditClass}
                onDeleteClass={onDeleteClass}
                podeGerenciar={podeGerenciar}
              />
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
