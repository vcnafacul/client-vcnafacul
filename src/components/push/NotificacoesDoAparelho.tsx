import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAuthStore } from "@/store/auth";
import { ambienteAtual, plataforma } from "@/services/push/plataforma";
import {
  CAMINHO_DAS_CONFIGURACOES,
  TEXTOS,
  type OndeConfigurar,
} from "./textosDoStatus";
import { Bell, BellOff, Share, SquarePlus } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

function ondeConfigurar(): OndeConfigurar {
  const ambiente = ambienteAtual();
  const p = plataforma(ambiente);
  if (p === "ios") return "iphone";
  if (p === "android") return ambiente.standalone ? "android-app" : "android";
  return "computador";
}

/** Legenda fixa: quem liga e desliga é o aparelho, não o site. */
function NasConfiguracoes({ acao }: { acao: "ativar" | "desativar" }) {
  return (
    <p className="text-sm text-slate-600">
      As notificações são controladas pelo seu aparelho. Para {acao}:{" "}
      <strong>{CAMINHO_DAS_CONFIGURACOES[ondeConfigurar()]}</strong>.
      {acao === "ativar" && " Depois, volte para esta página."}
    </p>
  );
}

function PassosInstalarNoIPhone() {
  return (
    <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-600">
      <li>
        No Safari, toque em Compartilhar{" "}
        <Share aria-hidden className="inline h-4 w-4 align-text-bottom" />.
      </li>
      <li>
        Escolha <strong>Adicionar à Tela de Início</strong>{" "}
        <SquarePlus aria-hidden className="inline h-4 w-4 align-text-bottom" />.
      </li>
      <li>Abra o Você na Facul pelo ícone novo.</li>
      <li>Volte a esta página e toque em Ativar.</li>
    </ol>
  );
}

/**
 * "Notificações neste aparelho" em Minha conta (série `pwa-push`, FE-04).
 * Espelha a permissão do aparelho: não há "Desativar" — desligar é nas
 * configurações (o site não consegue revogar a permissão). Some quando o push
 * está desligado no ambiente.
 */
export function NotificacoesDoAparelho() {
  const { status, aparelhos, aparelhosNaApi, ocupado, ativar, testar } =
    usePushNotifications();
  const [testando, setTestando] = useState(false);
  // "Enviar teste" só para quem pode enviar notificações (`enviarNotificacao`,
  // BE-03) — a api também exige a permissão (403 sem ela).
  const podeTestar = useAuthStore((s) => !!s.data.permissao.enviarNotificacao);

  if (!status || status === "disabled-by-flag") return null;
  const { titulo, texto } = TEXTOS[status];
  const ativo = status === "active";
  // ⚠️ "Ativo" vem da assinatura do NAVEGADOR. Se a api não tem nenhum
  // aparelho, o token não foi gravado e nada chega — tem de registrar de novo.
  const semRegistroNaApi = ativo && aparelhosNaApi === 0;

  // `ativar` direto no onClick: o pedido de permissão só vale dentro do gesto.
  const ativarComAviso = async () => {
    try {
      await ativar();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const enviarTeste = async () => {
    setTestando(true);
    try {
      const { successCount } = await testar();
      if (successCount > 0) {
        toast.success(
          "Enviamos. A notificação deve chegar em alguns segundos.",
        );
      } else {
        toast.warn("Não conseguimos entregar. Desative e ative de novo.");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setTestando(false);
    }
  };

  return (
    <section
      aria-labelledby="notificacoes-titulo"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start gap-3">
        {ativo ? (
          <Bell
            aria-hidden
            className="mt-0.5 h-5 w-5 shrink-0 text-green-600"
          />
        ) : (
          <BellOff
            aria-hidden
            className="mt-0.5 h-5 w-5 shrink-0 text-slate-400"
          />
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <h3 id="notificacoes-titulo" className="font-semibold text-marine">
            {titulo}
          </h3>
          <p className="text-sm text-slate-600">{texto}</p>
          {status === "denied" && <NasConfiguracoes acao="ativar" />}
          {status === "ios-needs-install" && <PassosInstalarNoIPhone />}
          {ativo && !semRegistroNaApi && aparelhos.length > 0 && (
            <p className="text-sm text-slate-500">
              {aparelhos.length === 1
                ? "Registrado no servidor neste aparelho."
                : `Registrado no servidor em ${aparelhos.length} aparelhos.`}
            </p>
          )}
          {semRegistroNaApi && (
            <p role="alert" className="text-sm text-orange">
              Este aparelho ainda não está registrado no servidor, então os
              avisos não chegam. Toque em Registrar de novo.
            </p>
          )}

          {ativo && <NasConfiguracoes acao="desativar" />}

          <div className="flex flex-wrap gap-2 pt-1">
            {status === "default" && (
              <Button onClick={ativarComAviso} disabled={ocupado}>
                Ativar notificações
              </Button>
            )}
            {semRegistroNaApi && (
              <Button onClick={ativarComAviso} disabled={ocupado}>
                Registrar de novo
              </Button>
            )}
            {ativo && !semRegistroNaApi && podeTestar && (
              <Button onClick={enviarTeste} disabled={testando || ocupado}>
                Enviar notificação de teste
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
