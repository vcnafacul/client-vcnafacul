import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FiEdit2, FiToggleLeft, FiToggleRight } from "react-icons/fi";
import { useAuthStore } from "@/store/auth";
import { EssayTheme } from "@/dtos/essay";
import {
  getThemes,
  createTheme,
  updateTheme,
  getEssaySettings,
  updateEssaySettings,
} from "@/services/essay";
import Toggle from "@/components/atoms/toggle";
import ThemeForm from "./ThemeForm";

function getThemeStatus(theme: EssayTheme): {
  label: string;
  color: string;
  bgColor: string;
} {
  const now = new Date();
  const start = new Date(theme.weekStart);
  const end = new Date(theme.weekEnd);
  // Normalize to compare dates only (ignore time)
  now.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (!theme.active) {
    return {
      label: "Inativo",
      color: "text-gray-500",
      bgColor: "bg-gray-100 text-gray-500",
    };
  }
  if (now < start) {
    return {
      label: "Agendado",
      color: "text-blue-600",
      bgColor: "bg-blue-50 text-blue-600",
    };
  }
  if (now > end) {
    return {
      label: "Encerrado",
      color: "text-orange-600",
      bgColor: "bg-orange-50 text-orange-600",
    };
  }
  return {
    label: "Ativo",
    color: "text-green-600",
    bgColor: "bg-green-50 text-green-600",
  };
}

export default function EssayThemeAdmin() {
  const {
    data: { token },
  } = useAuthStore();
  const [themes, setThemes] = useState<EssayTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EssayTheme | null | undefined>(
    undefined
  );
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiToggleLoading, setAiToggleLoading] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState<EssayTheme | null>(null);

  const loadThemes = () => {
    getThemes(token, 1, 50)
      .then((res) => setThemes(res.data))
      .catch(() => toast.error("Erro ao carregar temas"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadThemes();
    getEssaySettings(token)
      .then((s) => setAiEnabled(s.aiEnabled))
      .catch(() => {});
  }, [token]);

  const handleAiToggle = async (_name: string, checked: boolean) => {
    setAiToggleLoading(true);
    try {
      const result = await updateEssaySettings(token, { aiEnabled: checked });
      setAiEnabled(result.aiEnabled);
      toast.success(
        result.aiEnabled
          ? "Correção por IA ativada"
          : "Correção por IA desativada"
      );
    } catch {
      toast.error("Erro ao atualizar configuração");
    } finally {
      setAiToggleLoading(false);
    }
  };

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

  const handleToggleActive = async () => {
    if (!confirmToggle) return;
    const newActive = !confirmToggle.active;
    try {
      await updateTheme(token, confirmToggle.id, { active: newActive });
      toast.success(newActive ? "Tema ativado" : "Tema desativado");
      loadThemes();
    } catch (err: unknown) {
      const action = newActive ? "ativar" : "desativar";
      toast.error(
        err instanceof Error ? err.message : `Erro ao ${action} tema`
      );
    } finally {
      setConfirmToggle(null);
    }
  };

  if (loading) return <div className="p-6 text-center">Carregando...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-marine">Temas de Redação</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Correção por IA
            </span>
            <Toggle
              name="aiEnabled"
              checked={aiEnabled}
              handleCheck={handleAiToggle}
              disabled={aiToggleLoading}
            />
            <span
              className={`text-xs font-semibold ${aiEnabled ? "text-green-600" : "text-gray-400"}`}
            >
              {aiEnabled ? "Ativo" : "Inativo"}
            </span>
          </div>
          <button
            onClick={() => setEditing(null)}
            className="px-4 py-2 bg-marine text-white rounded-lg hover:bg-marine/90"
          >
            Novo Tema
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {themes.map((theme) => {
          const status = getThemeStatus(theme);
          return (
            <div
              key={theme.id}
              className={`border rounded-lg p-4 bg-white flex justify-between items-center ${
                !theme.active ? "opacity-60" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{theme.title}</h3>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${status.bgColor}`}
                  >
                    {status.label}
                  </span>
                </div>
                <p className="text-sm text-grey mt-1">
                  {new Date(theme.weekStart).toLocaleDateString("pt-BR")} —{" "}
                  {new Date(theme.weekEnd).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <button
                  onClick={() => setEditing(theme)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-marine transition-colors"
                  title="Editar"
                >
                  <FiEdit2 size={18} />
                </button>
                <button
                  onClick={() => setConfirmToggle(theme)}
                  className={`p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                    theme.active ? "text-green-600" : "text-gray-400"
                  }`}
                  title={theme.active ? "Desativar tema" : "Ativar tema"}
                >
                  {theme.active ? (
                    <FiToggleRight size={22} />
                  ) : (
                    <FiToggleLeft size={22} />
                  )}
                </button>
              </div>
            </div>
          );
        })}
        {themes.length === 0 && (
          <p className="text-center text-grey py-8">
            Nenhum tema cadastrado.
          </p>
        )}
      </div>
      {editing !== undefined && (
        <ThemeForm
          initial={editing}
          onSave={handleSave}
          onCancel={() => setEditing(undefined)}
        />
      )}
      {confirmToggle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 space-y-4">
            <h2 className="text-lg font-bold text-marine">
              {confirmToggle.active ? "Desativar tema" : "Ativar tema"}
            </h2>
            <p className="text-sm text-gray-700">
              {confirmToggle.active
                ? `Deseja desativar o tema "${confirmToggle.title}"? Ele não aparecerá mais para os alunos.`
                : `Deseja ativar o tema "${confirmToggle.title}"? Se estiver dentro do período, ele ficará disponível para os alunos.`}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmToggle(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleToggleActive}
                className="px-4 py-2 text-white rounded-lg bg-marine hover:bg-marine/90"
              >
                {confirmToggle.active ? "Desativar" : "Ativar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
