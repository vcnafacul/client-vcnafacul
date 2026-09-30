import { useState } from "react";
import { Smartphone } from "lucide-react";
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
  const convidar = !adiado && noCelular() && estado === "instalavel";
  if (convidar) return <BannerDoApp onAdiar={() => setAdiado(true)} />;
  return <BannerNotificacoes />;
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
