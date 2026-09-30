import { phoneMask } from "@/utils/phoneMask";
import { useMemo, useState } from "react";
import { IoEyeSharp } from "react-icons/io5";
import type { CollaboratorColumns } from ".";

/** Quantos cards a lista mostra de cada vez. */
export const TAMANHO_DA_PAGINA = 20;

interface Props {
  colaboradores: CollaboratorColumns[];
  /** Chave da foto → URL já carregada (a mesma que a tela monta). */
  fotos: Record<string, string>;
  onVer: (id: string) => void;
}

/**
 * Os colaboradores no celular: um card por pessoa no lugar do DataGrid, que em
 * 375px mostrava só a coluna de ações e o começo do nome.
 */
export function ListaDeColaboradoresMobile({
  colaboradores,
  fotos,
  onVer,
}: Props) {
  const [busca, setBusca] = useState("");
  const [visiveis, setVisiveis] = useState(TAMANHO_DA_PAGINA);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return colaboradores;
    return colaboradores.filter((c) =>
      `${c.name} ${c.email} ${c.role?.name ?? ""}`
        .toLowerCase()
        .includes(termo),
    );
  }, [colaboradores, busca]);

  return (
    <div className="w-full px-4 flex flex-col gap-3 pb-4">
      <input
        type="search"
        value={busca}
        onChange={(e) => {
          setBusca(e.target.value);
          setVisiveis(TAMANHO_DA_PAGINA);
        }}
        placeholder="Buscar por nome, email ou função"
        aria-label="Buscar colaborador"
        className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm"
      />
      <p className="text-xs text-gray-500">
        {filtrados.length} de {colaboradores.length} colaboradores
      </p>

      <ul className="flex flex-col gap-3">
        {filtrados.slice(0, visiveis).map((c) => {
          const foto = c.photo ? fotos[c.photo] : undefined;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onVer(c.id)}
                aria-label={`Ver ${c.name}`}
                className="w-full text-left bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3 active:bg-gray-50"
              >
                {foto ? (
                  <img
                    src={foto}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-zinc-200 shrink-0" />
                )}
                <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900 break-words min-w-0">
                      {c.name}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                        c.actived
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {c.actived ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 break-all">{c.email}</p>
                  <p className="text-xs text-gray-700">
                    {c.role?.name}
                    {c.phone && <> · {phoneMask(c.phone)}</>}
                  </p>
                </div>
                <IoEyeSharp className="h-5 w-5 fill-gray-400 shrink-0" />
              </button>
            </li>
          );
        })}
      </ul>

      {filtrados.length === 0 && (
        <p className="text-center text-sm text-gray-500 py-6">
          Nenhum colaborador encontrado
        </p>
      )}

      {visiveis < filtrados.length && (
        <button
          type="button"
          onClick={() => setVisiveis((v) => v + TAMANHO_DA_PAGINA)}
          className="h-10 w-full border border-marine text-marine rounded-md text-sm font-medium"
        >
          Mostrar mais ({filtrados.length - visiveis} restantes)
        </button>
      )}
    </div>
  );
}
