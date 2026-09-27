import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import {
  adiarBanner,
  alcanceDoBanner,
  bannerAdiado,
} from "@/services/push/adiarBanner";
import { ACCOUNT_PATH, DASH } from "@/routes/path";
import { useAuthStore } from "@/store/auth";
import { Bell } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * Convite discreto no dashboard para ativar as notificações (FE-04).
 *
 * - Só aparece em `default` (pode pedir) e `ios-needs-install` (precisa
 *   instalar). Nos outros estados, quem quiser vai a Minha conta.
 * - ⚠️ **Nunca pede a permissão nativa sozinho**: só no clique de "Ativar".
 *   Um prompt negado é quase irreversível.
 * - "Agora não" esconde por 30 dias (cookie — ver `adiarBanner`).
 * - Alcance pelo `VITE_PUSH_BANNER` (rollout do QA-01).
 */
export function BannerNotificacoes() {
  const profiles = useAuthStore((s) => s.data.profiles);
  const { status, ocupado, ativar } = usePushNotifications();
  const [adiado, setAdiado] = useState(bannerAdiado);

  const alcance = alcanceDoBanner();
  const noPublico =
    alcance === "todos" ||
    (alcance === "colaboradores" && profiles.includes("collaborator"));
  if (!noPublico || adiado) return null;
  if (status !== "default" && status !== "ios-needs-install") return null;

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
          <Button size="sm" onClick={ativar} disabled={ocupado}>
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
