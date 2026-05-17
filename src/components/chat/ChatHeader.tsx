import { useState } from "react";
import { ExternalLink, Monitor, Smartphone, Globe } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { closeConversation } from "@/services/chat/closeConversation";
import { useAuthStore } from "@/store/auth";
import { avatarColorFor, initialsOf } from "./avatarUtils";

interface Props {
  conversationId: string;
  title: string;
  subtitle?: string;
  onClose?: () => void;
  showAvatar?: boolean;
  avatarSeed?: string;
  status?: "open" | "closed";
  originPage?: string;
  device?: string;
  browser?: string;
}

export function ChatHeader({
  conversationId,
  title,
  subtitle,
  onClose,
  showAvatar = false,
  avatarSeed,
  status,
  originPage,
  device,
  browser,
}: Props) {
  const jwt = useAuthStore((s) => s.data.token);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleEnd() {
    setLoading(true);
    try {
      await closeConversation(jwt, conversationId);
      setConfirmOpen(false);
      onClose?.();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Falha ao encerrar conversa";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const avatarBg = avatarColorFor(avatarSeed ?? title);
  const isOpen = status === "open";

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b bg-marine text-white px-3 py-2">
        <div className="flex items-center gap-3 min-w-0">
          {showAvatar && (
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0 ring-2 ring-white/30",
                avatarBg,
              )}
              aria-hidden
            >
              {initialsOf(title)}
            </div>
          )}
          <div className="min-w-0 flex flex-col">
            <span className="font-semibold text-sm truncate">{title}</span>
            <div className="flex items-center gap-1.5 text-[11px]">
              {subtitle &&
                subtitle.split(" · ").map((part, i) =>
                  i === 0 && originPage ? (
                    <a
                      key={i}
                      href={originPage}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 transition truncate max-w-[240px]"
                      title={originPage}
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <span className="truncate">{part}</span>
                    </a>
                  ) : (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded-full bg-white/10 truncate max-w-[240px]"
                    >
                      {part}
                    </span>
                  ),
                )}
              {status && (
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full font-semibold",
                    isOpen
                      ? "bg-green/20 text-green"
                      : "bg-white/20 text-white/80",
                  )}
                >
                  {isOpen ? "aberta" : "encerrada"}
                </span>
              )}
              {device && (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/10"
                  title={`Dispositivo: ${device}`}
                >
                  {device === "mobile" ? (
                    <Smartphone className="h-3 w-3" />
                  ) : (
                    <Monitor className="h-3 w-3" />
                  )}
                  <span className="capitalize">{device}</span>
                </span>
              )}
              {browser && (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/10"
                  title={`Navegador: ${browser}`}
                >
                  <Globe className="h-3 w-3" />
                  <span className="capitalize">{browser}</span>
                </span>
              )}
            </div>
          </div>
        </div>
        {isOpen !== false && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            className="bg-pink hover:bg-pink/90 text-white shrink-0"
          >
            Encerrar
          </Button>
        )}
      </div>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Encerrar conversa</DialogTitle>
            <DialogDescription>
              A conversa será fechada e o estudante terá que abrir uma nova
              caso precise. Deseja continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEnd}
              disabled={loading}
              className="bg-pink hover:bg-pink/90 text-white"
            >
              {loading ? "Encerrando..." : "Sim, encerrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
