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
import { HomeFeature } from "../../../dtos/homeContent/homeFeature";
import { getHomeFeatures } from "../../../services/home/getHomeFeatures";
import { getHomeFeatureSection } from "../../../services/home/getHomeFeatureSection";
import { updateHomeFeatureSection } from "../../../services/home/updateHomeFeatureSection";
import { deleteHomeFeature } from "../../../services/home/deleteHomeFeature";
import { reorderHomeFeatures } from "../../../services/home/reorderHomeFeatures";
import SortableFeatureRow from "../components/SortableFeatureRow";
import ModalEditFeature from "../modals/ModalEditFeature";

export default function FeaturesSection() {
  const {
    data: { token },
  } = useAuthStore();
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionDescription, setSectionDescription] = useState("");
  const [features, setFeatures] = useState<HomeFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HomeFeature | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    Promise.all([getHomeFeatureSection(), getHomeFeatures()])
      .then(([section, list]) => {
        if (section?.title) setSectionTitle(section.title);
        if (section?.description) setSectionDescription(section.description);
        setFeatures(list);
      })
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const saveSection = async () => {
    setSavingSection(true);
    try {
      await updateHomeFeatureSection(
        { title: sectionTitle, description: sectionDescription },
        token,
      );
      toast.success("Seção atualizada");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSavingSection(false);
    }
  };

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = features.findIndex((f) => f.id === active.id);
    const newIndex = features.findIndex((f) => f.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(features, oldIndex, newIndex);
    const previous = features;
    setFeatures(reordered);
    try {
      await reorderHomeFeatures(
        { items: reordered.map((f, i) => ({ id: f.id, order: i + 1 })) },
        token,
      );
    } catch (err) {
      setFeatures(previous);
      toast.error((err as Error).message);
    }
  };

  const onDelete = async (f: HomeFeature) => {
    if (!window.confirm(`Excluir "${f.title}"?`)) return;
    try {
      await deleteHomeFeature(f.id, token);
      setFeatures((prev) => prev.filter((x) => x.id !== f.id));
      toast.success("Item excluído");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (f: HomeFeature) => {
    setEditing(f);
    setModalOpen(true);
  };

  const onCreated = (f: HomeFeature) => {
    setFeatures((prev) => [...prev, f]);
    setModalOpen(false);
  };

  const onUpdated = (f: HomeFeature) => {
    setFeatures((prev) => prev.map((x) => (x.id === f.id ? f : x)));
    setModalOpen(false);
  };

  if (loading) return <div className="p-4">Carregando...</div>;

  return (
    <section className="flex flex-col gap-4 p-4 border rounded-lg bg-white">
      <h2 className="text-xl font-semibold">Futuro do Cursinho Popular</h2>
      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Título da seção</span>
          <input
            className="border rounded px-2 py-1"
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Descrição da seção</span>
          <textarea
            className="border rounded px-2 py-1"
            rows={2}
            value={sectionDescription}
            onChange={(e) => setSectionDescription(e.target.value)}
            placeholder="Subtítulo exibido abaixo do título"
          />
        </label>
        <div className="flex justify-end">
          <Button
            typeStyle="primary"
            size="small"
            onClick={saveSection}
            disabled={savingSection}
          >
            {savingSection ? "Salvando..." : "Salvar seção"}
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">
          {features.length} item(s)
        </span>
        <Button typeStyle="primary" size="small" onClick={openCreate}>
          Adicionar item
        </Button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={features.map((f) => f.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {features.map((f) => (
              <SortableFeatureRow
                key={f.id}
                feature={f}
                onEdit={openEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <ModalEditFeature
        isOpen={modalOpen}
        handleClose={() => setModalOpen(false)}
        feature={editing}
        onCreated={onCreated}
        onUpdated={onUpdated}
      />
    </section>
  );
}
