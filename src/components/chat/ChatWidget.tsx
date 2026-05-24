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
import {
  CooldownError,
  openConversation,
} from "@/services/chat/openConversation";
import { useAuthStore } from "@/store/auth";
import { useChatStore } from "@/store/chatStore";
import { ChatLayout } from "./ChatLayout";
import { ConfirmOpenDialog } from "./ConfirmOpenDialog";
import { UnreadBadge } from "./UnreadBadge";

function detectDevice(): "mobile" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  return window.matchMedia("(max-width: 768px)").matches ? "mobile" : "desktop";
}

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${s}s`;
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
  const cooldownUntil = useChatStore((s) => s.cooldownUntil);
  const setCooldownUntil = useChatStore((s) => s.setCooldownUntil);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [chatClosed, setChatClosed] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [device, setDevice] = useState<"mobile" | "desktop">(detectDevice);
  const prevActiveRef = useRef<typeof active>(null);
  const { pathname } = useLocation();
  const matchedRoute = CHAT_ENABLED_ROUTES.find((r) =>
    matchPath({ path: r.pattern, end: true }, pathname)
  );
  const routeEnabled = !!matchedRoute;

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

  useEffect(() => {
    if (prevActiveRef.current && !active && isOpen) {
      setChatClosed(true);
    }
    if (active) {
      setChatClosed(false);
    }
    prevActiveRef.current = active;
  }, [active, isOpen]);

  useEffect(() => {
    if (!cooldownUntil) { setRemainingSeconds(0); return; }
    const compute = () => Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
    setRemainingSeconds(compute());
    const id = setInterval(() => {
      const r = compute();
      setRemainingSeconds(r);
      if (r <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

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

  const shouldRender = routeEnabled || !!active || chatClosed || remainingSeconds > 0;
  if (role !== "student") return null;
  if (!shouldRender) return null;

  function handleClick() {
    if (active) { setOpen(true); return; }
    if (remainingSeconds > 0) {
      toast.info(`Aguarde ${formatCountdown(remainingSeconds)} para iniciar uma nova conversa`);
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
      const inscriptionContext = (() => {
        if (!matchedRoute) return undefined;
        const match = matchPath({ path: matchedRoute.pattern, end: true }, pathname);
        const paramValue = match?.params[matchedRoute.routeParam];
        if (!paramValue) return undefined;
        return { [matchedRoute.paramKey]: paramValue };
      })();
      await openConversation(jwt, meta, inscriptionContext);
      // listener do ChatProvider vai atualizar activeConversation
      setConfirmOpen(false);
      setOpen(true);
    } catch (e) {
      if (e instanceof CooldownError) {
        setConfirmOpen(false);
        setCooldownUntil(Date.now() + e.retryAfterSeconds * 1000);
        setOpen(true);
        toast.info(
          "Aguarde um instante para abrir uma nova sessão.",
        );
      } else {
        toast.error(e instanceof Error ? e.message : "Falha ao abrir conversa");
      }
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

  function handleWidgetClose() {
    setOpen(false);
    setActive(null);
    setChatClosed(false);
  }

  const panel = chatClosed ? (
    <div className="flex flex-col items-center justify-center h-full p-6 gap-4 text-center">
      <p className="text-sm text-muted-foreground">
        Esta conversa foi encerrada. Se precisar de mais ajuda, você pode abrir
        uma nova conversa.
      </p>
      {remainingSeconds > 0 ? (
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-bold font-mono text-marine">
            {formatCountdown(remainingSeconds)}
          </span>
          <span className="text-xs text-muted-foreground">
            Aguarde para iniciar uma nova conversa
          </span>
        </div>
      ) : (
        <Button size="sm" onClick={() => { setChatClosed(false); setConfirmOpen(true); }}>
          Iniciar nova conversa
        </Button>
      )}
    </div>
  ) : active && userId ? (
    <div className="h-full w-full">
      <ChatLayout
        conversationId={active.id}
        currentUserId={userId}
        title="Suporte Você na Facul"
        status={active.status}
        onClose={handleWidgetClose}
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
        <Sheet open={isOpen} onOpenChange={(v) => { setOpen(v); if (!v) setChatClosed(false); }}>
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
        <Popover open={isOpen} onOpenChange={(v) => { setOpen(v); if (!v) setChatClosed(false); }}>
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
