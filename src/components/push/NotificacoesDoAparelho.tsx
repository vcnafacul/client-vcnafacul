import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { TEXTOS } from "./textosDoStatus";
import { Bell, BellOff, Share, SquarePlus } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

function PassosDesbloquear() {
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
      <li>
        <strong>Chrome no Android:</strong> toque no ícone à esquerda do
        endereço → Permissões → Notificações → Permitir.
      </li>
      <li>
        <strong>Chrome/Edge no computador:</strong> clique no ícone à esquerda
        do endereço → Notificações → Permitir.
      </li>
      <li>
        <strong>iPhone (app instalado):</strong> Ajustes → Notificações → Você
        na Facul → Permitir Notificações.
      </li>
      <li>Depois, recarregue a página.</li>
    </ul>
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
 * Some quando o push está desligado no ambiente (homol, dev).
 */
export function NotificacoesDoAparelho() {
  const { status, aparelhos, ocupado, ativar, desativar, testar } =
    usePushNotifications();
  const [testando, setTestando] = useState(false);

  if (!status || status === "disabled-by-flag") return null;
  const { titulo, texto } = TEXTOS[status];
  const ativo = status === "active";

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
          {status === "denied" && <PassosDesbloquear />}
          {status === "ios-needs-install" && <PassosInstalarNoIPhone />}
          {ativo && aparelhos.length > 1 && (
            <p className="text-sm text-slate-500">
              Ativas em {aparelhos.length} aparelhos.
            </p>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {(status === "default" || status === "granted-not-registered") && (
              // ⚠️ `ativar` direto no onClick: o pedido de permissão só vale
              // dentro do gesto do usuário.
              <Button onClick={ativar} disabled={ocupado}>
                Ativar notificações
              </Button>
            )}
            {ativo && (
              <>
                <Button onClick={enviarTeste} disabled={testando || ocupado}>
                  Enviar notificação de teste
                </Button>
                <Button
                  variant="outline"
                  onClick={desativar}
                  disabled={ocupado}
                >
                  Desativar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
