import { useEffect, useRef, useState } from "react";
import { MessageCircle, TriangleAlert } from "lucide-react";
import { toast } from "react-toastify";
import { matchPath, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useChatContext } from "@/context/ChatProvider";
import { CHAT_ENABLED_ROUTES } from "@/routes/chatEnabledRoutes";
import { markRead } from "@/services/chat/markRead";
import { openConversation } from "@/services/chat/openConversation";
import { useAuthStore } from "@/store/auth";
import { useChatStore } from "@/store/chatStore";
import { ChatLayout } from "./ChatLayout";
import { ConfirmOpenDialog } from "./ConfirmOpenDialog";
import { UnreadBadge } from "./UnreadBadge";

function detectDevice(): "mobile" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  return window.matchMedia("(max-width: 768px)").matches ? "mobile" : "desktop";
}

function detectBrowser(): string {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("edg")) return "edge";
  if (ua.includes("chrome")) return "chrome";
  if (ua.includes("firefox")) return "firefox";
  if (ua.includes("safari")) return "safari";
  return "other";
}

export function ChatWidget() {
  const { role, userId } = useChatContext();
  const jwt = useAuthStore((s) => s.data.token);
  const isOpen = useChatStore((s) => s.isOpen);
  const setOpen = useChatStore((s) => s.setOpen);
  const active = useChatStore((s) => s.activeConversation);
  const setActive = useChatStore((s) => s.setActiveConversation);
  const setOpening = useChatStore((s) => s.setOpening);
  const opening = useChatStore((s) => s.isOpening);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [device, setDevice] = useState<"mobile" | "desktop">(detectDevice);
  const { pathname } = useLocation();
  const routeEnabled = CHAT_ENABLED_ROUTES.some((pattern) =>
    matchPath({ path: pattern, end: true }, pathname)
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = () => setDevice(mq.matches ? "mobile" : "desktop");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (isOpen && active && (active.unreadCountStudent ?? 0) > 0 && jwt) {
      markRead(jwt, active.id).catch(() => {});
    }
  }, [isOpen, active, jwt]);

  const hasPending =
    !!active &&
    (active.unreadCountStudent ?? 0) > 0 &&
    active.lastMessageSenderType === "support";

  const prevPendingRef = useRef(false);
  useEffect(() => {
    if (hasPending && !prevPendingRef.current) {
      const audio = new Audio("/sounds/notify.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {
        /* autoplay policy: best-effort */
      });
    }
    prevPendingRef.current = hasPending;
  }, [hasPending]);

  const shouldRender = routeEnabled || !!active;
  if (role !== "student") return null;
  if (!shouldRender) return null;

  function handleClick() {
    if (active) {
      setOpen(true);
      return;
    }
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    if (!jwt) return;
    setOpening(true);
    try {
      const meta = {
        page: window.location.pathname,
        userAgent: navigator.userAgent.slice(0, 500),
        device: detectDevice(),
        browser: detectBrowser(),
      };
      await openConversation(jwt, meta);
      // listener do ChatProvider vai atualizar activeConversation
      setConfirmOpen(false);
      setOpen(true);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Falha ao abrir conversa";
      toast.error(message);
    } finally {
      setOpening(false);
    }
  }

  const buttonClassName = `fixed bottom-6 right-6 rounded-full h-12 px-5 shadow-lg z-50 gap-2 bg-marine hover:bg-marine/90 text-white ring-1 ring-white/10 transition-transform hover:scale-105${
    hasPending ? " animate-attention-ring" : ""
  }`;

  const button = (
    <Button
      variant="default"
      className={buttonClassName}
      onClick={handleClick}
      aria-label={hasPending ? "Mensagem do suporte pendente" : "Precisa de ajuda?"}
    >
      {hasPending ? (
        <MessageCircle className="h-5 w-5 text-orange" />
      ) : (
        <TriangleAlert className="h-5 w-5 text-orange" />
      )}
      <span className="font-medium">
        {hasPending ? "Mensagem do Suporte" : "Precisa de ajuda?"}
      </span>
      {(active?.unreadCountStudent ?? 0) > 0 && (
        <span className="absolute -top-1 -right-1">
          <UnreadBadge count={active?.unreadCountStudent ?? 0} />
        </span>
      )}
    </Button>
  );

  const panel =
    active && userId ? (
      <div className="h-full w-full">
        <ChatLayout
          conversationId={active.id}
          currentUserId={userId}
          title="Suporte Você na Facul"
          onClose={() => {
            setOpen(false);
            setActive(null);
          }}
        />
      </div>
    ) : null;

  return (
    <>
      {button}
      <ConfirmOpenDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirm}
        loading={opening}
      />
      {device === "mobile" ? (
        <Sheet open={isOpen} onOpenChange={setOpen}>
          <SheetContent side="bottom" className="h-[85vh] p-0 flex flex-col">
            <SheetHeader className="sr-only">
              <SheetTitle>Suporte Você na Facul</SheetTitle>
              <SheetDescription>
                Conversa com a equipe de suporte
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 min-h-0">{panel}</div>
          </SheetContent>
        </Sheet>
      ) : (
        <Popover open={isOpen} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <span
              className="fixed bottom-6 right-6 h-14 w-14 pointer-events-none"
              aria-hidden
            />
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="end"
            className="w-[380px] h-[520px] p-0"
          >
            {panel}
          </PopoverContent>
        </Popover>
      )}
    </>
  );
}
