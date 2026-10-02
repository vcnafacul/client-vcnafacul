import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { caminhoInterno } from "@/services/push/caminho";
import type { NotificacaoDaCentral } from "@/services/notificacoes";
import { useAuthStore } from "@/store/auth";
import { useCentralStore } from "@/store/notificacoes";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/** "9+" acima de 9: o sino é pequeno. */
export function rotuloDoContador(n: number): string | null {
  if (n <= 0) return null;
  return n > 9 ? "9+" : String(n);
}

/** sm = 768, como no resto do projeto. */
const TELA_PEQUENA = "(max-width: 767px)";

/**
 * ⚠️ `matchMedia?.`: o sino fica no Header, que é montado em muitos testes, e
 * o jsdom não tem `matchMedia` — sem a guarda, todos quebrariam.
 */
function useTelaPequena(): boolean {
  const [pequena, setPequena] = useState(
    () => window.matchMedia?.(TELA_PEQUENA).matches ?? false,
  );
  useEffect(() => {
    const mq = window.matchMedia?.(TELA_PEQUENA);
    if (!mq) return;
    const mudou = () => setPequena(mq.matches);
    mq.addEventListener("change", mudou);
    return () => mq.removeEventListener("change", mudou);
  }, []);
  return pequena;
}

function haQuanto(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ptBR });
}

function Item({
  n,
  onAbrir,
}: {
  n: NotificacaoDaCentral;
  onAbrir: (n: NotificacaoDaCentral) => void;
}) {
  const lida = !!n.lidaEm;
  return (
    <li>
      <button
        type="button"
        onClick={() => onAbrir(n)}
        className={`flex w-full gap-3 px-4 py-3 text-left hover:bg-slate-50 ${
          lida ? "opacity-60" : ""
        }`}
      >
        <span
          aria-hidden
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
            lida ? "bg-transparent" : "bg-orange"
          }`}
        />
        <span className="min-w-0 flex-1">
          <span
            className={`block text-sm text-marine ${lida ? "" : "font-semibold"}`}
          >
            {n.titulo}
            {!lida && <span className="sr-only"> (não lida)</span>}
          </span>
          <span className="line-clamp-2 block text-sm text-slate-600">
            {n.corpo}
          </span>
          <span className="block text-xs text-slate-400">
            {haQuanto(n.createdAt)}
          </span>
        </span>
      </button>
    </li>
  );
}

/** O conteúdo da central — o mesmo no Popover (desktop) e no Sheet (mobile). */
export function ListaDaCentral({ onFechar }: { onFechar: () => void }) {
  const token = useAuthStore((s) => s.data.token);
  const { itens, naoLidas, marcarLida, marcarTodas } = useCentralStore();
  const navigate = useNavigate();

  const abrir = (n: NotificacaoDaCentral) => {
    void marcarLida(n.id, token);
    // ⚠️ Só caminho do próprio site — a mesma barreira do push (phishing).
    const caminho = caminhoInterno(n.url ?? undefined);
    if (caminho) {
      onFechar();
      navigate(caminho);
    }
  };

  return (
    <div className="flex max-h-[70vh] flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="font-semibold text-marine">Notificações</h2>
        {naoLidas > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void marcarTodas(token)}
          >
            Marcar todas como lidas
          </Button>
        )}
      </div>
      {itens.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-slate-500">
          Nenhuma notificação por aqui.
        </p>
      ) : (
        <ul
          aria-label="Notificações"
          className="divide-y divide-slate-100 overflow-y-auto"
        >
          {itens.map((n) => (
            <Item key={n.id} n={n} onAbrir={abrir} />
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Sino da central de notificações (série `central-notificacoes`, card 03).
 * Popover no desktop, Sheet de baixo no mobile (sm = 768, como no resto do
 * projeto). Só aparece logado.
 */
export function SinoDaCentral({ solid = true }: { solid?: boolean }) {
  const token = useAuthStore((s) => s.data.token);
  const { naoLidas, carregar, limpar } = useCentralStore();
  const [aberto, setAberto] = useState(false);
  const mobile = useTelaPequena();

  useEffect(() => {
    if (!token) {
      limpar();
      return;
    }
    carregar(token).catch(() => undefined);
  }, [token, carregar, limpar]);

  if (!token) return null;

  const rotulo = rotuloDoContador(naoLidas);
  const sino = (
    <button
      type="button"
      aria-label={
        naoLidas > 0 ? `Notificações, ${naoLidas} não lidas` : "Notificações"
      }
      onClick={mobile ? () => setAberto(true) : undefined}
      className={`relative rounded-full p-2 ${
        solid
          ? "text-marine hover:bg-slate-100"
          : "text-white hover:bg-white/10"
      }`}
    >
      <Bell aria-hidden className="h-5 w-5" />
      {rotulo && (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange px-1 text-[10px] font-bold leading-none text-white"
        >
          {rotulo}
        </span>
      )}
    </button>
  );

  if (mobile) {
    return (
      <>
        {sino}
        <Sheet open={aberto} onOpenChange={setAberto}>
          <SheetContent side="bottom" className="p-0">
            <SheetTitle className="sr-only">Notificações</SheetTitle>
            <ListaDaCentral onFechar={() => setAberto(false)} />
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <Popover open={aberto} onOpenChange={setAberto}>
      <PopoverTrigger asChild>{sino}</PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <ListaDaCentral onFechar={() => setAberto(false)} />
      </PopoverContent>
    </Popover>
  );
}
