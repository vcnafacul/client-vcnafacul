import { dataLocal, formatDate } from "@/utils/date";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Edit2, ToggleLeft, ToggleRight } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ThemeForm from "./ThemeForm";

function getThemeStatus(theme: EssayTheme): {
  label: string;
  color: string;
  bgColor: string;
} {
  const now = new Date();
  // Datas sem hora (coluna `date`): em horário local, não UTC.
  const start = dataLocal(String(theme.weekStart));
  const end = dataLocal(String(theme.weekEnd));
  // Normalize to compare dates only (ignore time)
  now.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (!theme.active) {
    return {
      label: "Inativo",
      color: "text-muted-foreground",
      bgColor: "bg-muted text-muted-foreground",
    };
  }
  if (now < start) {
    return {
      label: "Agendado",
      color: "text-info",
      bgColor: "bg-info-muted text-info",
    };
  }
  if (now > end) {
    return {
      label: "Encerrado",
      color: "text-muted-foreground",
      bgColor: "bg-muted text-muted-foreground",
    };
  }
  return {
    label: "Ativo",
    color: "text-success",
    bgColor: "bg-success-muted text-success",
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
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h1 className="text-h1 font-bold text-foreground">Temas de Redação</h1>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="text-body font-medium text-foreground">
              Correção por IA
            </span>
            <Toggle
              name="aiEnabled"
              checked={aiEnabled}
              handleCheck={handleAiToggle}
              disabled={aiToggleLoading}
            />
            <span
              className={`text-caption font-semibold ${aiEnabled ? "text-success" : "text-muted-foreground"}`}
            >
              {aiEnabled ? "Ativo" : "Inativo"}
            </span>
          </div>
          <button
            onClick={() => setEditing(null)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
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
              className={`border rounded-lg p-3 sm:p-4 bg-white flex justify-between items-center ${
                !theme.active ? "opacity-60" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{theme.title}</h3>
                  <span
                    className={`text-caption font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${status.bgColor}`}
                  >
                    {status.label}
                  </span>
                </div>
                <p className="text-body text-muted-foreground mt-1">
                  {formatDate(String(theme.weekStart))} —{" "}
                  {formatDate(String(theme.weekEnd))}
                </p>
              </div>
              <div className="flex items-center gap-1 ml-2 sm:ml-4">
                <button
                  onClick={() => setEditing(theme)}
                  className="p-2 rounded-lg hover:bg-muted text-foreground transition-colors"
                  title="Editar"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => setConfirmToggle(theme)}
                  className={`p-2 rounded-lg hover:bg-muted transition-colors ${
                    theme.active ? "text-success" : "text-muted-foreground"
                  }`}
                  title={theme.active ? "Desativar tema" : "Ativar tema"}
                >
                  {theme.active ? (
                    <ToggleRight size={22} />
                  ) : (
                    <ToggleLeft size={22} />
                  )}
                </button>
              </div>
            </div>
          );
        })}
        {themes.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
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
        <AlertDialog
          open
          onOpenChange={(aberto) => !aberto && setConfirmToggle(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmToggle.active ? "Desativar tema" : "Ativar tema"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmToggle.active
                  ? `Deseja desativar o tema "${confirmToggle.title}"? Ele não aparecerá mais para os alunos.`
                  : `Deseja ativar o tema "${confirmToggle.title}"? Se estiver dentro do período, ele ficará disponível para os alunos.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleToggleActive}>
                {confirmToggle.active ? "Desativar" : "Ativar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
