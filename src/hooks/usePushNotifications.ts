import {
  enviarTeste,
  listarMeusAparelhos,
  type AparelhoAtivo,
} from "@/services/push/api";
import {
  disablePush,
  enablePush,
  getPushStatus,
  type PushStatus,
} from "@/services/push/push";
import { useAuthStore } from "@/store/auth";
import { useCallback, useEffect, useState } from "react";

/**
 * Estado do push NESTE aparelho, para a UI de "Ativar notificações" (FE-04).
 *
 * ⚠️ Nada aqui vai para `localStorage`: o `main.tsx` o limpa a cada deploy. A
 * fonte da verdade é o navegador (permissão + assinatura) e a api.
 */
export function usePushNotifications() {
  const token = useAuthStore((s) => s.data.token);
  const [status, setStatus] = useState<PushStatus | null>(null);
  const [aparelhos, setAparelhos] = useState<AparelhoAtivo[]>([]);
  const [ocupado, setOcupado] = useState(false);

  const atualizarAparelhos = useCallback(async () => {
    if (!token) return;
    try {
      setAparelhos(await listarMeusAparelhos(token));
    } catch {
      /* a contagem é informativa; não bloqueia a UI */
    }
  }, [token]);

  useEffect(() => {
    let cancelado = false;
    getPushStatus()
      .then((s) => {
        if (!cancelado) setStatus(s);
      })
      .catch(() => {
        if (!cancelado) setStatus("unsupported");
      });
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    if (status === "active") void atualizarAparelhos();
  }, [status, atualizarAparelhos]);

  /** ⚠️ Chamar direto do `onClick` — ver `enablePush`. */
  const ativar = async () => {
    setOcupado(true);
    try {
      setStatus(await enablePush(token));
    } finally {
      setOcupado(false);
    }
  };

  const desativar = async () => {
    setOcupado(true);
    try {
      await disablePush();
      setStatus(await getPushStatus());
      await atualizarAparelhos();
    } finally {
      setOcupado(false);
    }
  };

  const testar = () => enviarTeste(token);

  return { status, aparelhos, ocupado, ativar, desativar, testar };
}
