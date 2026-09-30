import { FrenteDto, SubjectDto } from "@/dtos/content/contentDtoInput";
import { UpdateSubjectDto } from "@/dtos/content/SubjectDto";
import { ChangeOrderDTO } from "@/dtos/content/changeOrder";
import { useModals } from "@/hooks/useModal";
import { changeOrderDemand } from "@/services/content/changeOrderDemand";
import { useAuthStore } from "@/store/auth";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useAcimaDeSm } from "@/components/dashV2/useAcimaDeSm";
import { Roles } from "@/enums/roles/roles";
import { useState } from "react";
import { FrentesActionMenu } from "./frentesActionMenu";
import ManagerSubject from "../managerSubject";
import OrderEditContent from "../orderEditContent";
import { countByStatus, SortableTemaRow } from "./sortableTemaRow";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { StatusContent } from "@/enums/content/statusContent";

interface Props {
  frente: FrenteDto;
  temas: SubjectDto[];
  onUpdateTema: (body: UpdateSubjectDto) => Promise<void>;
  onDeleteTema: (id: string) => Promise<void>;
  onReorderTemas: (node1: string, node2: string) => Promise<void>;
}

export function RenderTemasTable({
  frente,
  temas,
  onUpdateTema,
  onDeleteTema,
  onReorderTemas,
}: Props) {
  const [temaSelected, setTemaSelected] = useState<SubjectDto | null>(null);

  const {
    data: { token, permissao },
  } = useAuthStore();
  // Abaixo de 768px (o `sm` do projeto) a sub-tabela (~550px) vira cards.
  const acimaDeSm = useAcimaDeSm();
  const podeReordenar = !!permissao[Roles.gerenciadorDemanda];
  const idDe = (t: SubjectDto) => t._id || t.id;
  const excluirTema = (tema: SubjectDto) =>
    (tema.contents?.length ?? 0) === 0
      ? () => onDeleteTema(idDe(tema))
      : undefined;

  const modals = useModals(["temaEditor", "orderEditContent"]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    await onReorderTemas(String(active.id), String(over.id));
  };

  const handleEditTema = (tema: SubjectDto) => {
    setTemaSelected(tema);
    modals.temaEditor.open();
  };

  const handleReorderContents = (tema: SubjectDto) => {
    setTemaSelected(tema);
    modals.orderEditContent.open();
  };

  const cardsNoCelular = (
    <ul className="flex flex-col gap-2">
      {temas.map((tema, i) => {
        const contents = tema.contents ?? [];
        const total = contents.length;
        return (
          <li key={idDe(tema)} className="border rounded-lg p-3 flex flex-col gap-2">
            <p className="font-medium break-words">{tema.name}</p>
            <p className="text-xs text-gray-600">
              Aprovadas {countByStatus(contents, StatusEnum.Approved)}/{total} ·
              Pendentes {countByStatus(contents, StatusEnum.Pending)}/{total} ·
              Upload {countByStatus(contents, StatusContent.Pending_Upload)}/{total}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-1 border-t pt-2">
              {podeReordenar ? (
                // No toque o arrastar não funciona: ↑/↓ usam a mesma chamada.
                <div className="flex">
                  <button
                    type="button"
                    aria-label="Mover para cima"
                    disabled={i === 0}
                    onClick={() => onReorderTemas(idDe(tema), idDe(temas[i - 1]))}
                    className="h-10 w-10 disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Mover para baixo"
                    disabled={i === temas.length - 1}
                    onClick={() => onReorderTemas(idDe(tema), idDe(temas[i + 1]))}
                    className="h-10 w-10 disabled:opacity-30"
                  >
                    ↓
                  </button>
                </div>
              ) : (
                <span />
              )}
              <div>
                <FrentesActionMenu
                  onEdit={() => handleEditTema(tema)}
                  onReorder={() => handleReorderContents(tema)}
                  onDelete={excluirTema(tema)}
                  menuType="tema"
                  tamanho="medium"
                  confirmarExclusao={`Excluir o tema ${tema.name}?`}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {!acimaDeSm ? (
        cardsNoCelular
      ) : (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <TableContainer
          component={Paper}
          elevation={1}
          sx={{ borderRadius: 2, overflowX: "auto" }}
        >
          <Table aria-label="temas" size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "grey.50" }}>
                <TableCell sx={{ fontWeight: "bold", width: 40 }} />
                <TableCell sx={{ fontWeight: "bold" }}>Nome</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Aprovadas
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Pendentes
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Pendentes Upload
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <SortableContext
                items={temas.map((t) => t._id || t.id)}
                strategy={verticalListSortingStrategy}
              >
                {temas.map((tema) => (
                  <SortableTemaRow
                    key={tema._id || tema.id}
                    tema={tema}
                    onEdit={() => handleEditTema(tema)}
                    onReorderContents={() => handleReorderContents(tema)}
                    onDelete={excluirTema(tema)}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </TableContainer>
      </DndContext>
      )}

      {modals.temaEditor.isOpen && temaSelected && (
        <ManagerSubject
          isOpen={modals.temaEditor.isOpen}
          frente={frente}
          subject={temaSelected}
          newSubject={async () => {
            /* no-op — edit mode only */
          }}
          editSubject={onUpdateTema}
          handleClose={() => {
            modals.temaEditor.close();
            setTemaSelected(null);
          }}
        />
      )}

      {modals.orderEditContent.isOpen && temaSelected && (
        <OrderEditContent
          isOpen={modals.orderEditContent.isOpen}
          handleClose={() => {
            modals.orderEditContent.close();
            setTemaSelected(null);
          }}
          contents={temaSelected.contents}
          updateOrder={(dto: ChangeOrderDTO) => changeOrderDemand(token, dto)}
          // Sem isto, reabrir mostrava a ordem antiga (o tema não era atualizado).
          aoSalvar={(ordenados) => {
            temaSelected.contents = ordenados as SubjectDto["contents"];
          }}
        />
      )}
    </>
  );
}
