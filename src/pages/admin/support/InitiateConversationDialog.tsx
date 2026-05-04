import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { initiateConversation } from "@/services/chat/initiateConversation";
import { getUserByName, type SearchUser } from "@/services/auth/getUserByName";
import { useAuthStore } from "@/store/auth";
import { initialsOf } from "@/components/chat/avatarUtils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (conversationId: string) => void;
}

const MAX_LEN = 1000;

export function InitiateConversationDialog({
  open,
  onOpenChange,
  onCreated,
}: Props) {
  const jwt = useAuthStore((s) => s.data.token);
  const [stage, setStage] = useState<"searching" | "composing">("searching");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<SearchUser | null>(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reset internal state every time dialog reopens
  useEffect(() => {
    if (!open) {
      setStage("searching");
      setQuery("");
      setDebounced("");
      setResults([]);
      setSelected(null);
      setContent("");
    }
  }, [open]);

  // Debounce query
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  // Fetch results
  useEffect(() => {
    if (!jwt || debounced.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getUserByName(jwt, debounced)
      .then((users) => {
        if (!cancelled) setResults(users);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced, jwt]);

  const remaining = useMemo(() => MAX_LEN - content.length, [content.length]);
  const canSubmit = content.trim().length > 0 && !submitting;

  async function handleSubmit() {
    if (!jwt || !selected) return;
    setSubmitting(true);
    try {
      const { conversationId } = await initiateConversation(
        jwt,
        selected.id,
        content,
      );
      toast.success("Conversa iniciada");
      onCreated(conversationId);
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao iniciar conversa");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {stage === "searching" ? "Iniciar conversa" : "Mensagem inicial"}
          </DialogTitle>
          <DialogDescription>
            {stage === "searching"
              ? "Busque o estudante pelo nome."
              : `Conversa com ${selected?.name}`}
          </DialogDescription>
        </DialogHeader>

        {stage === "searching" ? (
          <div className="flex flex-col gap-3">
            <Input
              autoFocus
              placeholder="Digite ao menos 2 caracteres"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="max-h-72 overflow-y-auto flex flex-col gap-1">
              {loading && (
                <div className="text-sm text-muted-foreground">Buscando…</div>
              )}
              {!loading && debounced.length >= 2 && results.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  Nenhum estudante encontrado
                </div>
              )}
              {results.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    setSelected(u);
                    setStage("composing");
                  }}
                  className="flex items-center gap-3 rounded-md p-2 hover:bg-muted text-left"
                >
                  <span className="h-8 w-8 rounded-full bg-marine text-white text-sm flex items-center justify-center">
                    {initialsOf(u.name)}
                  </span>
                  <span className="flex flex-col">
                    <span className="font-medium text-sm">{u.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {u.email}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Textarea
              autoFocus
              rows={4}
              maxLength={MAX_LEN}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite a mensagem inicial"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{remaining} caracteres restantes</span>
            </div>
            <div className="flex justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStage("searching")}
                disabled={submitting}
              >
                Voltar
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                {submitting ? "Enviando…" : "Enviar mensagem"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
