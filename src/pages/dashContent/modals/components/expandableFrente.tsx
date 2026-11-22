import { FrenteDto, SubjectDto } from "@/dtos/content/contentDtoInput";
import { UpdateSubjectDto } from "@/dtos/content/SubjectDto";
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
import { FrentesActionMenu } from "./frentesActionMenu";
import { RenderTemasTable } from "./renderTemasTable";

interface Props {
  frente: FrenteDto;
  temas: SubjectDto[];
  onEditFrente: () => void;
  onDeleteFrente?: () => void;
  onAddTema: () => void;
  onUpdateTema: (body: UpdateSubjectDto) => Promise<void>;
  onDeleteTema: (id: string) => Promise<void>;
  onReorderTemas: (node1: string, node2: string) => Promise<void>;
}

export function ExpandableFrente({
  frente,
  temas,
  onEditFrente,
  onDeleteFrente,
  onAddTema,
  onUpdateTema,
  onDeleteTema,
  onReorderTemas,
}: Props) {
  const [open, setOpen] = useState(false);
  const id = frente._id || frente.id;
  const idDetalhes = useId();
  const total = temas.length;
  const rotulo = open ? "Recolher" : "Expandir";

  return (
    <>
      <TableRow
        key={id}
        data-state={open ? "selected" : undefined}
        className="hover:bg-accent"
      >
        <TableCell className="w-16 border-l-4 border-l-primary">
          {total > 0 && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`${rotulo} temas de ${frente.nome}`}
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
          <span className="text-body font-bold text-foreground">
            {frente.nome}
          </span>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex flex-col items-end">
            <span className="text-body font-bold">{total}</span>
            <span className="text-caption text-muted-foreground">temas</span>
          </div>
        </TableCell>
        <TableCell className="w-10 text-right">
          <FrentesActionMenu
            onAdd={onAddTema}
            addLabel="Adicionar Tema"
            onEdit={onEditFrente}
            onDelete={total === 0 ? onDeleteFrente : undefined}
            menuType="frente"
          />
        </TableCell>
      </TableRow>
      {open && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={4} className="py-0">
            <div id={idDetalhes} className="m-2">
              <h4 className="mb-2 text-h4 font-bold text-primary">
                Temas ({total})
              </h4>
              <RenderTemasTable
                frente={frente}
                temas={temas}
                onUpdateTema={onUpdateTema}
                onDeleteTema={onDeleteTema}
                onReorderTemas={onReorderTemas}
              />
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

/**
 * A frente no celular: a tabela de 4 colunas deixava as ações parcialmente
 * fora da tela, e a sub-tabela de temas (~550px) alargava tudo. Aqui é card,
 * e os temas abrem nele (o RenderTemasTable já vira cards no celular).
 */
export function FrenteCard({
  frente,
  temas,
  onEditFrente,
  onDeleteFrente,
  onAddTema,
  onUpdateTema,
  onDeleteTema,
  onReorderTemas,
}: Props) {
  const [open, setOpen] = useState(false);
  const total = temas.length;
  return (
    <li className="border border-l-4 border-l-primary rounded-lg p-3 flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-bold break-words min-w-0">{frente.nome}</p>
        <FrentesActionMenu
          onAdd={onAddTema}
          addLabel="Adicionar Tema"
          onEdit={onEditFrente}
          onDelete={total === 0 ? onDeleteFrente : undefined}
          menuType="frente"
          tamanho="medium"
        />
      </div>
      {total > 0 ? (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="flex items-center gap-1 h-10 text-body font-medium text-foreground self-start"
        >
          <ChevronDown
            className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`}
          />
          {total} {total === 1 ? "tema" : "temas"}
        </button>
      ) : (
        <span className="text-body text-muted-foreground">Sem temas</span>
      )}
      {open && (
        <RenderTemasTable
          frente={frente}
          temas={temas}
          onUpdateTema={onUpdateTema}
          onDeleteTema={onDeleteTema}
          onReorderTemas={onReorderTemas}
        />
      )}
    </li>
  );
}
