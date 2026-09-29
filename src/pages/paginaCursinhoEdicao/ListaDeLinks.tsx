import { FiPlus, FiTrash2 } from "react-icons/fi";
import { LinkDaPagina } from "@/services/paginaCursinho";
import { LINKS_MAX } from "@/utils/regrasDaPagina";

type Props = {
  titulo: string;
  ajuda: string;
  links: LinkDaPagina[];
  onChange: (links: LinkDaPagina[]) => void;
};

/** Lista editável de links (título + URL). */
export function ListaDeLinks({ titulo, ajuda, links, onChange }: Props) {
  const muda = (i: number, campo: keyof LinkDaPagina, valor: string) =>
    onChange(links.map((l, j) => (j === i ? { ...l, [campo]: valor } : l)));

  return (
    <fieldset className="space-y-2">
      <legend className="block text-sm font-semibold">{titulo}</legend>
      <p className="text-xs text-grey">{ajuda}</p>
      {links.map((l, i) => (
        <div key={i} className="flex flex-col sm:flex-row gap-2">
          <input
            aria-label={`${titulo}: título do link ${i + 1}`}
            placeholder="Título"
            value={l.titulo}
            maxLength={100}
            onChange={(e) => muda(i, "titulo", e.target.value)}
            className="sm:w-1/3 border rounded-lg p-2"
          />
          <input
            aria-label={`${titulo}: endereço do link ${i + 1}`}
            placeholder="https://..."
            type="url"
            value={l.url}
            maxLength={500}
            onChange={(e) => muda(i, "url", e.target.value)}
            className="flex-1 border rounded-lg p-2"
          />
          <button
            type="button"
            onClick={() => onChange(links.filter((_, j) => j !== i))}
            className="p-2 rounded-lg hover:bg-gray-100 text-red-600 self-start"
            title="Remover link"
            aria-label={`${titulo}: remover link ${i + 1}`}
          >
            <FiTrash2 />
          </button>
        </div>
      ))}
      {links.length < LINKS_MAX && (
        <button
          type="button"
          onClick={() => onChange([...links, { titulo: "", url: "" }])}
          className="flex items-center gap-1 text-sm text-marine hover:underline"
        >
          <FiPlus /> Adicionar link
        </button>
      )}
    </fieldset>
  );
}
