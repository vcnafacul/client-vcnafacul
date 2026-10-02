import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import {
  adiarBanner,
  alcanceDoBanner,
  bannerAdiado,
} from "@/services/push/adiarBanner";
import { ACCOUNT_PATH, DASH } from "@/routes/path";
import { useAuthStore } from "@/store/auth";
import { Bell, BellOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { CAMINHO_DAS_CONFIGURACOES, ondeConfigurar } from "./textosDoStatus";

/**
 * Convite discreto no dashboard para ativar as notificações (FE-04).
 *
 * - Só aparece em `default` (pode pedir) e `ios-needs-install` (precisa
 *   instalar). Nos outros estados, quem quiser vai a Minha conta.
 * - ⚠️ **Nunca pede a permissão nativa sozinho**: só no clique de "Ativar".
 *   Um prompt negado é quase irreversível.
 * - Bloqueou no prompt (ou o sistema bloqueou): em vez de sumir calado, o
 *   banner explica que está bloqueado e onde liberar — o navegador não deixa
 *   perguntar de novo.
 * - "Agora não" esconde por 30 dias (cookie — ver `adiarBanner`).
 * - Alcance pelo `VITE_PUSH_BANNER` (rollout do QA-01).
 */
export function BannerNotificacoes() {
  const profiles = useAuthStore((s) => s.data.profiles);
  const { status, ocupado, ativar } = usePushNotifications();
  const [adiado, setAdiado] = useState(bannerAdiado);
  // Só quem bloqueou NESTE clique vê a explicação aqui; quem já chegou
  // bloqueado não vê o banner (o caminho está em Minha conta).
  const [bloqueouAgora, setBloqueouAgora] = useState(false);

  const alcance = alcanceDoBanner();
  const noPublico =
    alcance === "todos" ||
    (alcance === "colaboradores" && profiles.includes("collaborator"));
  if (!noPublico || adiado) return null;

  if (bloqueouAgora) {
    return (
      <div
        role="region"
        aria-label="Notificações bloqueadas"
        className="flex flex-col gap-3 rounded-2xl border border-orange/30 bg-orange/5 p-4 sm:flex-row sm:items-center"
      >
        <BellOff
          aria-hidden
          className="hidden h-5 w-5 shrink-0 text-orange sm:block"
        />
        <p className="flex-1 text-sm text-marine">
          <strong>As notificações ficaram bloqueadas.</strong> O navegador não
          deixa o site perguntar de novo. Para receber os avisos, libere em:{" "}
          <strong>{CAMINHO_DAS_CONFIGURACOES[ondeConfigurar()]}</strong>.
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setBloqueouAgora(false)}
          >
            Entendi
          </Button>
        </div>
      </div>
    );
  }

  if (status !== "default" && status !== "ios-needs-install") return null;

  // ⚠️ `ativar` é a primeira coisa do clique: o pedido só vale dentro do gesto.
  const ativarAqui = async () => {
    try {
      if ((await ativar()) === "denied") setBloqueouAgora(true);
    } catch {
      toast.error(
        "Não foi possível ativar as notificações agora. Tente de novo em Minha conta.",
      );
    }
  };

  const agoraNao = () => {
    adiarBanner();
    setAdiado(true);
  };

  return (
    <div
      role="region"
      aria-label="Ativar notificações"
      className="flex flex-col gap-3 rounded-2xl border border-orange/30 bg-orange/5 p-4 sm:flex-row sm:items-center"
    >
      <Bell
        aria-hidden
        className="hidden h-5 w-5 shrink-0 text-orange sm:block"
      />
      <p className="flex-1 text-sm text-marine">
        {status === "ios-needs-install"
          ? "Quer receber avisos do Você na Facul no iPhone? Primeiro adicione o site à Tela de Início."
          : "Quer receber avisos do Você na Facul no celular, mesmo com o site fechado?"}
      </p>
      <div className="flex gap-2">
        {status === "default" ? (
          <Button size="sm" onClick={ativarAqui} disabled={ocupado}>
            Ativar
          </Button>
        ) : (
          <Button size="sm" asChild>
            <Link to={`${DASH}/${ACCOUNT_PATH}`}>Como fazer</Link>
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={agoraNao}>
          Agora não
        </Button>
      </div>
    </div>
  );
}
