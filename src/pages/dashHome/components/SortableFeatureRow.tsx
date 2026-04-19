import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { HomeFeature } from "../../../dtos/homeContent/homeFeature";
import { homeContentFile } from "../../../services/urls";

export default function SortableFeatureRow({
  feature,
  onEdit,
  onDelete,
}: {
  feature: HomeFeature;
  onEdit: (f: HomeFeature) => void;
  onDelete: (f: HomeFeature) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: feature.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 border rounded bg-white"
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing px-2 text-gray-500"
        aria-label="Arrastar para reordenar"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      {feature.imageUrl ? (
        <img
          src={homeContentFile(feature.imageUrl)}
          alt={feature.title}
          className="w-12 h-12 object-cover rounded"
        />
      ) : (
        <div className="w-12 h-12 rounded bg-gray-200" />
      )}
      <span className="flex-1 font-medium">{feature.title}</span>
      <button
        type="button"
        className="text-sm text-blue-600 hover:underline"
        onClick={() => onEdit(feature)}
      >
        Editar
      </button>
      <button
        type="button"
        className="text-sm text-red-600 hover:underline"
        onClick={() => onDelete(feature)}
      >
        Excluir
      </button>
    </div>
  );
}
