import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuthStore } from "@/store/auth";
import { EssayTheme } from "@/dtos/essay";
import { getThemes, createTheme, updateTheme, deleteTheme } from "@/services/essay";
import ThemeForm from "./ThemeForm";

export default function EssayThemeAdmin() {
  const { data: { token } } = useAuthStore();
  const [themes, setThemes] = useState<EssayTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EssayTheme | null | undefined>(undefined);
  // undefined = form closed, null = creating new, EssayTheme = editing

  const loadThemes = () => {
    getThemes(token, 1, 50)
      .then((res) => setThemes(res.data))
      .catch(() => toast.error("Erro ao carregar temas"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadThemes();
  }, [token]);

  const handleSave = async (data: {
    title: string;
    motivationalText: string;
    instruction: string;
    weekStart: string;
    weekEnd: string;
  }) => {
    try {
      if (editing) {
        await updateTheme(token, editing.id, data);
        toast.success("Tema atualizado");
      } else {
        await createTheme(token, data as any);
        toast.success("Tema criado");
      }
      setEditing(undefined);
      loadThemes();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar tema");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Desativar este tema?")) return;
    try {
      await deleteTheme(token, id);
      toast.success("Tema desativado");
      loadThemes();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao desativar tema");
    }
  };

  if (loading) return <div className="p-6 text-center">Carregando...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-marine">Temas de Redação</h1>
        <button
          onClick={() => setEditing(null)}
          className="px-4 py-2 bg-marine text-white rounded-lg hover:bg-marine/90"
        >
          Novo Tema
        </button>
      </div>
      <div className="space-y-3">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className="border rounded-lg p-4 bg-white flex justify-between items-start"
          >
            <div>
              <h3 className="font-semibold">{theme.title}</h3>
              <p className="text-sm text-grey">
                {new Date(theme.weekStart).toLocaleDateString("pt-BR")} —{" "}
                {new Date(theme.weekEnd).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(theme)}
                className="text-sm text-marine underline"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(theme.id)}
                className="text-sm text-red-500 underline"
              >
                Desativar
              </button>
            </div>
          </div>
        ))}
      </div>
      {editing !== undefined && (
        <ThemeForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => setEditing(undefined)}
        />
      )}
    </div>
  );
}
