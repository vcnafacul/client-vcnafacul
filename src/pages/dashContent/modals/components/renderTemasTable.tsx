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
import { useState } from "react";
import ManagerSubject from "../managerSubject";
import OrderEditContent from "../orderEditContent";
import { SortableTemaRow } from "./sortableTemaRow";

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
    data: { token },
  } = useAuthStore();

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

  return (
    <>
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
                    onDelete={
                      (tema.contents?.length ?? 0) === 0
                        ? () => onDeleteTema(tema._id || tema.id)
                        : undefined
                    }
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </TableContainer>
      </DndContext>

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
        />
      )}
    </>
  );
}
