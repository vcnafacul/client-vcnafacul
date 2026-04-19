import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { HomeSupporter } from "../../../dtos/homeContent/homeSupporter";
import { homeContentFile } from "../../../services/urls";

export default function SortableSupporterRow({
  supporter,
  onEdit,
  onDelete,
}: {
  supporter: HomeSupporter;
  onEdit: (s: HomeSupporter) => void;
  onDelete: (s: HomeSupporter) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: supporter.id });

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
      {supporter.logoUrl ? (
        <img
          src={homeContentFile(supporter.logoUrl)}
          alt={supporter.name}
          className="w-12 h-12 object-contain rounded bg-white"
        />
      ) : (
        <div className="w-12 h-12 rounded bg-gray-200" />
      )}
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="font-medium truncate">{supporter.name}</span>
        <a
          href={supporter.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 truncate hover:underline"
          title={supporter.link}
        >
          {supporter.link}
        </a>
      </div>
      <button
        type="button"
        className="text-sm text-blue-600 hover:underline"
        onClick={() => onEdit(supporter)}
      >
        Editar
      </button>
      <button
        type="button"
        className="text-sm text-red-600 hover:underline"
        onClick={() => onDelete(supporter)}
      >
        Excluir
      </button>
    </div>
  );
}
