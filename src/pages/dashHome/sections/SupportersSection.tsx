import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Button from "@/components/molecules/button";
import { useAuthStore } from "../../../store/auth";
import { HomeSupporter } from "../../../dtos/homeContent/homeSupporter";
import { getHomeSupporters } from "../../../services/home/getHomeSupporters";
import { deleteHomeSupporter } from "../../../services/home/deleteHomeSupporter";
import { reorderHomeSupporters } from "../../../services/home/reorderHomeSupporters";
import SortableSupporterRow from "../components/SortableSupporterRow";
import ModalEditSupporter from "../modals/ModalEditSupporter";

export default function SupportersSection() {
  const {
    data: { token },
  } = useAuthStore();
  const [supporters, setSupporters] = useState<HomeSupporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HomeSupporter | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    getHomeSupporters()
      .then((list) => setSupporters(list))
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = supporters.findIndex((s) => s.id === active.id);
    const newIndex = supporters.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(supporters, oldIndex, newIndex);
    const previous = supporters;
    setSupporters(reordered);
    try {
      await reorderHomeSupporters(
        { items: reordered.map((s, i) => ({ id: s.id, order: i + 1 })) },
        token,
      );
    } catch (err) {
      setSupporters(previous);
      toast.error((err as Error).message);
    }
  };

  const onDelete = async (s: HomeSupporter) => {
    if (!window.confirm(`Excluir "${s.name}"?`)) return;
    try {
      await deleteHomeSupporter(s.id, token);
      setSupporters((prev) => prev.filter((x) => x.id !== s.id));
      toast.success("Apoiador excluído");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (s: HomeSupporter) => {
    setEditing(s);
    setModalOpen(true);
  };

  const onCreated = (s: HomeSupporter) => {
    setSupporters((prev) => [...prev, s]);
    setModalOpen(false);
  };

  const onUpdated = (s: HomeSupporter) => {
    setSupporters((prev) => prev.map((x) => (x.id === s.id ? s : x)));
    setModalOpen(false);
  };

  if (loading) return <div className="p-4">Carregando...</div>;

  return (
    <section className="flex flex-col gap-4 p-4 border rounded-lg bg-white">
      <h2 className="text-xl font-semibold">Apoiadores</h2>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">
          {supporters.length} apoiador(es)
        </span>
        <Button typeStyle="primary" size="small" onClick={openCreate}>
          Adicionar apoiador
        </Button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={supporters.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {supporters.map((s) => (
              <SortableSupporterRow
                key={s.id}
                supporter={s}
                onEdit={openEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <ModalEditSupporter
        isOpen={modalOpen}
        handleClose={() => setModalOpen(false)}
        supporter={editing}
        onCreated={onCreated}
        onUpdated={onUpdated}
      />
    </section>
  );
}
