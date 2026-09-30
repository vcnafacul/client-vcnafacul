import { useEffect, useState } from "react";
import { Share, Smartphone } from "lucide-react";
import { listarMeusAparelhos } from "@/services/push/api";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { BannerNotificacoes } from "@/components/push/BannerNotificacoes";
import { ambienteAtual, plataforma } from "@/services/push/plataforma";
import { instalar, useEstadoDaInstalacao } from "@/pwa/instalacao";
import { adiarBannerDoApp, bannerDoAppAdiado } from "@/pwa/adiarBannerDoApp";

/** Só celular: no desktop o convite fica no menu do usuário (card 04). */
const noCelular = () => {
  const p = plataforma(ambienteAtual());
  return p === "android" || p === "ios";
};

/**
 * Topo do dashboard, em ETAPAS (tickets/029, R4): enquanto dá para instalar o
 * app, o convite do app; depois (ou se a pessoa adiou), o banner de
 * notificações de sempre. Nunca os dois juntos.
 */
export function BannerDoTopo() {
  const estado = useEstadoDaInstalacao();
  const [adiado, setAdiado] = useState(bannerDoAppAdiado);
  const jaInstalouNoIphone = useJaInstalouNoIphone(estado === "ios" && !adiado);
  const adiar = () => setAdiado(true);

  if (!adiado && noCelular()) {
    if (estado === "instalavel") return <BannerDoApp onAdiar={adiar} />;
    // ⚠️ Só mostra a instrução depois de saber que ele NÃO instalou (`false`);
    // enquanto pergunta (`null`), nada — evita piscar para quem já tem o app.
    if (estado === "ios" && jaInstalouNoIphone === false) {
      return <InstrucaoDoIphone onAdiar={adiar} />;
    }
  }
  return <BannerNotificacoes />;
}

/**
 * iPhone: o Safari não diz se o app está instalado, e o app instalado tem
 * armazenamento SEPARADO do Safari — um flag local não serviria. O sinal é o
 * aparelho registrado no push em modo app (`ios` + `standalone`) — tickets/029,
 * card 03. `null` enquanto não sabe; erro = "não sabe" → mostra (é só um aviso).
 */
function useJaInstalouNoIphone(perguntar: boolean): boolean | null {
  const token = useAuthStore((s) => s.data.token);
  const [ja, setJa] = useState<boolean | null>(null);
  useEffect(() => {
    if (!perguntar) return;
    let cancelado = false;
    listarMeusAparelhos(token)
      .then((aparelhos) => {
        if (!cancelado) {
          setJa(aparelhos.some((a) => a.platform === "ios" && a.standalone));
        }
      })
      .catch(() => !cancelado && setJa(false));
    return () => {
      cancelado = true;
    };
  }, [perguntar, token]);
  return ja;
}

/** O iOS não tem prompt programável: o que dá é ensinar o caminho. */
export function InstrucaoDoIphone({ onAdiar }: { onAdiar: () => void }) {
  const entendi = () => {
    adiarBannerDoApp();
    onAdiar();
  };
  return (
    <div
      role="region"
      aria-label="Instalar o app"
      className="flex flex-col gap-3 rounded-2xl border border-marine/20 bg-marine/5 p-4 sm:flex-row sm:items-center"
    >
      <Smartphone aria-hidden className="hidden h-5 w-5 shrink-0 text-marine sm:block" />
      <p className="flex-1 text-sm text-marine">
        <strong>O Você na Facul agora tem app!</strong> No iPhone, toque em{" "}
        <strong className="inline-flex items-center gap-1 whitespace-nowrap">
          Compartilhar <Share aria-hidden className="h-4 w-4" />
        </strong>{" "}
        e depois em <strong>Adicionar à Tela de Início</strong>.
      </p>
      <div className="flex gap-2">
        <Button size="sm" variant="ghost" onClick={entendi}>
          Entendi
        </Button>
      </div>
    </div>
  );
}

/** "O Você na Facul agora tem app!" — o botão abre o prompt NATIVO. */
export function BannerDoApp({ onAdiar }: { onAdiar: () => void }) {
  const [ocupado, setOcupado] = useState(false);

  const adiar = () => {
    adiarBannerDoApp();
    onAdiar();
  };

  const instalarAgora = async () => {
    setOcupado(true);
    try {
      // Recusou no prompt do navegador = "Agora não" por 30 dias (R3).
      // Aceitou: o estado vira "instalado" e o banner sai sozinho.
      if ((await instalar()) === "recusou") adiar();
    } finally {
      setOcupado(false);
    }
  };

  return (
    <div
      role="region"
      aria-label="Instalar o app"
      className="flex flex-col gap-3 rounded-2xl border border-marine/20 bg-marine/5 p-4 sm:flex-row sm:items-center"
    >
      <Smartphone aria-hidden className="hidden h-5 w-5 shrink-0 text-marine sm:block" />
      <p className="flex-1 text-sm text-marine">
        <strong>O Você na Facul agora tem app!</strong> Instale para abrir direto da tela do
        celular e receber avisos.
      </p>
      <div className="flex gap-2">
        <Button size="sm" onClick={instalarAgora} disabled={ocupado}>
          Instalar
        </Button>
        <Button size="sm" variant="ghost" onClick={adiar}>
          Agora não
        </Button>
      </div>
    </div>
  );
}
