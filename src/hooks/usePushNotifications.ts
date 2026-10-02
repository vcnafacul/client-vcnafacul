import {
  enviarTeste,
  listarMeusAparelhos,
  type AparelhoAtivo,
} from "@/services/push/api";
import {
  enablePush,
  getPushStatus,
  bloqueadoPeloSistema,
  registrarSePermitido,
  type PushStatus,
} from "@/services/push/push";
import { useAuthStore } from "@/store/auth";
import { useCallback, useEffect, useState } from "react";

/**
 * Estado do push NESTE aparelho, para a UI de "Ativar notificações" (FE-04).
 *
 * ⚠️ **Espelha a permissão do aparelho** (decisão de 2026-10-01): ligar e
 * desligar é nas configurações do celular/navegador. O status é relido quando
 * a permissão muda e quando a pessoa volta ao app (ela foi às configurações).
 *
 * ⚠️ Nada aqui vai para `localStorage`: o `main.tsx` o limpa a cada deploy. A
 * fonte da verdade é o navegador (permissão) e a api (aparelhos gravados).
 */
export function usePushNotifications() {
  const token = useAuthStore((s) => s.data.token);
  const [status, setStatus] = useState<PushStatus | null>(null);
  const [aparelhos, setAparelhos] = useState<AparelhoAtivo[]>([]);
  /** `null` = ainda não perguntou à api (ou ela falhou). */
  const [aparelhosNaApi, setAparelhosNaApi] = useState<number | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const atualizarAparelhos = useCallback(async () => {
    if (!token) return;
    try {
      const lista = await listarMeusAparelhos(token);
      setAparelhos(lista);
      setAparelhosNaApi(lista.length);
    } catch {
      /* a contagem é informativa; não bloqueia a UI */
    }
  }, [token]);

  const reler = useCallback(() => {
    getPushStatus()
      .then(setStatus)
      .catch(() => setStatus("unsupported"));
  }, []);

  useEffect(() => {
    reler();

    const aoVoltar = () => {
      if (document.visibilityState === "visible") reler();
    };
    document.addEventListener("visibilitychange", aoVoltar);

    // `onchange` da Permissions API: nem todo navegador expõe (o iOS antigo
    // não) — o `visibilitychange` cobre a volta das configurações.
    let permissao: PermissionStatus | undefined;
    navigator.permissions
      ?.query({ name: "notifications" as PermissionName })
      .then((p) => {
        permissao = p;
        p.onchange = reler;
      })
      .catch(() => undefined);

    return () => {
      document.removeEventListener("visibilitychange", aoVoltar);
      if (permissao) permissao.onchange = null;
    };
  }, [reler]);

  // Permitido nas configurações → garante o token na api, sem perguntar nada.
  useEffect(() => {
    if (status !== "active" || !token) return;
    void registrarSePermitido(token)
      .catch((e) => {
        // A página diz "permitido", mas o sistema bloqueou: mostra a verdade.
        if (bloqueadoPeloSistema(e)) setStatus("denied");
        // Outros erros: a contagem abaixo mostra que não gravou.
      })
      .then(atualizarAparelhos);
  }, [status, token, atualizarAparelhos]);

  /**
   * ⚠️ Chamar direto do `onClick` — ver `enablePush`. Devolve o status novo:
   * quem chamou mostra o "bloqueado" na hora (o banner, por exemplo, some do
   * `default` e precisa explicar o porquê).
   */
  const ativar = async (): Promise<PushStatus> => {
    setOcupado(true);
    try {
      const novo = await enablePush(token);
      setStatus(novo);
      if (novo === "active") await atualizarAparelhos();
      return novo;
    } catch (e) {
      // Permitiu no prompt, mas o sistema bloqueou o app (Android, nas
      // configurações do app instalado): para a pessoa, é "bloqueado".
      if (bloqueadoPeloSistema(e)) {
        setStatus("denied");
        return "denied";
      }
      throw e;
    } finally {
      setOcupado(false);
    }
  };

  const testar = () => enviarTeste(token);

  return {
    status,
    aparelhos,
    aparelhosNaApi,
    ocupado,
    ativar,
    testar,
  };
}
