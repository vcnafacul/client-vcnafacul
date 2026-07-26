import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Cog6ToothIcon, TrashIcon } from "@heroicons/react/24/outline";
import Button from "../../../../components/molecules/button";
import ModalTemplate from "../../../../components/templates/modalTemplate";
import { ICategoria } from "../../../../dtos/categoria/categoria";
import { getCategorias } from "../../../../services/categoria/getCategorias";
import { useAuthStore } from "../../../../store/auth";
import CreateForm, { ExameOption } from "./createForm";
import DeleteConfirm from "./deleteConfirm";
import { isProtegida } from "./protectedTipos";

interface ManageCategoriasProps {
  isOpen: boolean;
  handleClose: () => void;
  onCategoriasChanged: (categorias: ICategoria[]) => void;
}

type View = "lista" | "criar" | "excluir";

function ManageCategorias({
  isOpen,
  handleClose,
  onCategoriasChanged,
}: ManageCategoriasProps) {
  const {
    data: { token },
  } = useAuthStore();

  const [view, setView] = useState<View>("lista");
  const [categorias, setCategorias] = useState<ICategoria[]>([]);
  const [categoriaParaExcluir, setCategoriaParaExcluir] =
    useState<ICategoria | null>(null);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    getCategorias(token)
      .then((res) => setCategorias(res.data))
      .catch((erro: Error) => toast.error(erro.message));
  }, [token]);

  const exameOptions: ExameOption[] = useMemo(() => {
    const map = new Map<string, string>();
    categorias.forEach((c) => {
      if (c.exame && !map.has(c.exame._id)) {
        map.set(c.exame._id, c.exame.nome);
      }
    });
    return Array.from(map, ([value, label]) => ({ value, label }));
  }, [categorias]);

  const categoriasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return categorias;
    return categorias.filter((c) => c.nome.toLowerCase().includes(termo));
  }, [categorias, busca]);

  const propagar = (novas: ICategoria[]) => {
    setCategorias(novas);
    onCategoriasChanged(novas);
  };

  const handleCreated = (categoria: ICategoria) => {
    propagar([...categorias, categoria]);
    setView("lista");
  };

  const handleDeleted = (id: string) => {
    propagar(categorias.filter((c) => c._id !== id));
    setCategoriaParaExcluir(null);
    setView("lista");
  };

  const abrirExcluir = (categoria: ICategoria) => {
    setCategoriaParaExcluir(categoria);
    setView("excluir");
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="w-full max-w-3xl rounded-lg bg-white shadow-xl p-2"
    >
      {view === "lista" && (
        <div className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Cog6ToothIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Gerenciar Categorias
            </h2>
          </div>

          <div className="mb-4 flex items-center justify-between gap-3">
            <Button
              typeStyle="quaternary"
              size="small"
              onClick={() => setView("criar")}
            >
              + Nova Categoria
            </Button>
            <input
              type="text"
              value={busca}
              placeholder="Buscar por nome"
              onChange={(e) => setBusca(e.target.value)}
              className="w-64 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            {categoriasFiltradas.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-500">
                Nenhuma categoria encontrada.
              </p>
            )}
            {categoriasFiltradas.map((c) => {
              const protegida = isProtegida(c.nome);
              const qtd =
                c.quantidadeTotalQuestao == null
                  ? "livre"
                  : `${c.quantidadeTotalQuestao} questões`;
              return (
                <div
                  key={c._id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-900">
                      {c.nome}
                    </span>
                    <span className="text-sm text-gray-500">
                      Exame: {c.exame?.nome ?? "—"} · {qtd} · {c.duracao} min ·{" "}
                      {c.selecionavel ? "Selecionável" : "Uso interno"}
                    </span>
                    {protegida && (
                      <span className="text-xs font-medium text-amber-600">
                        🔒 Categoria seedada
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={protegida}
                    title={
                      protegida
                        ? "Categoria seedada — não pode ser excluída"
                        : "Excluir categoria"
                    }
                    onClick={() => abrirExcluir(c)}
                    className="text-gray-400 enabled:hover:text-red disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "criar" && (
        <CreateForm
          exameOptions={exameOptions}
          token={token}
          onCreated={handleCreated}
          onCancel={() => setView("lista")}
        />
      )}

      {view === "excluir" && categoriaParaExcluir && (
        <DeleteConfirm
          categoria={categoriaParaExcluir}
          token={token}
          onDeleted={handleDeleted}
          onCancel={() => {
            setCategoriaParaExcluir(null);
            setView("lista");
          }}
        />
      )}
    </ModalTemplate>
  );
}

export default ManageCategorias;
