import { create } from "zustand";
import { ambienteAtual, ehIOS, type Ambiente } from "@/services/push/plataforma";

/**
 * Convite de instalação do app (tickets/029, card 01).
 *
 * O `beforeinstallprompt` é o jeito de chamar o prompt NATIVO do navegador
 * (Chrome, Edge, Samsung no Android; Chrome/Edge no desktop). E ele **só
 * dispara quando o app ainda não está instalado** — é o sinal que evita
 * convidar quem já instalou.
 *
 * ⚠️ Capturado no boot (`main.tsx`), não no dashboard: o evento dispara cedo,
 * às vezes antes de qualquer tela montar, e não se repete.
 */

/** Não está no `lib.dom` do TypeScript. */
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type EstadoInterno = {
  evento: BeforeInstallPromptEvent | null;
  instalado: boolean;
};

export const useInstalacaoDoApp = create<EstadoInterno>(() => ({
  evento: null,
  instalado: false,
}));

export type EstadoDaInstalacao =
  /** Já está no app, ou acabou de instalar. */
  | "instalado"
  /** O navegador ofereceu: dá para chamar o prompt nativo. */
  | "instalavel"
  /** iPhone/iPad: não há prompt programável — só instrução. */
  | "ios"
  /** Navegador sem suporte (Firefox Android…), ou o evento ainda não veio. */
  | "indisponivel";

export function estadoDaInstalacao(
  estado: EstadoInterno,
  ambiente: Ambiente,
): EstadoDaInstalacao {
  if (estado.instalado || ambiente.standalone) return "instalado";
  if (estado.evento) return "instalavel";
  if (ehIOS(ambiente)) return "ios";
  return "indisponivel";
}

/** O estado para a tela (reage a evento novo e a `appinstalled`). */
export function useEstadoDaInstalacao(): EstadoDaInstalacao {
  const estado = useInstalacaoDoApp();
  return estadoDaInstalacao(estado, ambienteAtual());
}

let iniciado = false;

/** Chamar uma vez, no boot. Idempotente. */
export function iniciarCapturaDaInstalacao(alvo: Window = window): void {
  if (iniciado) return;
  iniciado = true;
  alvo.addEventListener("beforeinstallprompt", (e) => {
    // Sem isto o Chrome mostra a mini-barra dele; o nosso convite é o único.
    e.preventDefault();
    useInstalacaoDoApp.setState({ evento: e as BeforeInstallPromptEvent });
  });
  alvo.addEventListener("appinstalled", () => {
    useInstalacaoDoApp.setState({ evento: null, instalado: true });
  });
}

export type ResultadoDaInstalacao = "aceitou" | "recusou" | "indisponivel";

/**
 * Abre o prompt nativo. ⚠️ Chamar dentro de um clique. O evento só serve UMA
 * vez: depois de usado, é descartado — o navegador manda outro se ainda der
 * para instalar.
 */
export async function instalar(): Promise<ResultadoDaInstalacao> {
  const { evento } = useInstalacaoDoApp.getState();
  if (!evento) return "indisponivel";
  useInstalacaoDoApp.setState({ evento: null });
  await evento.prompt();
  const { outcome } = await evento.userChoice;
  if (outcome === "accepted") {
    useInstalacaoDoApp.setState({ instalado: true });
    return "aceitou";
  }
  return "recusou";
}

/** Só para os testes. */
export function __resetarInstalacao(): void {
  iniciado = false;
  useInstalacaoDoApp.setState({ evento: null, instalado: false });
}
