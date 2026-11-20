import { buscarEnvio, type Envio } from "@/services/push/admin";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";
import { motivoDaFalha } from "../regras";

export const INTERVALO_MS = 2000;

/**
 * Acompanha um envio em segundo plano (a api responde 202) até sair de
 * `sending`, sem recarregar a página.
 */
export function AcompanharEnvio({ id }: { id: string }) {
  const token = useAuthStore((s) => s.data.token);
  const [envio, setEnvio] = useState<Envio | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    let timer: ReturnType<typeof setTimeout>;
    const consultar = async () => {
      try {
        const atual = await buscarEnvio(id, token);
        if (!ativo) return;
        setEnvio(atual);
        if (atual.status === "sending")
          timer = setTimeout(consultar, INTERVALO_MS);
      } catch (e) {
        if (ativo) setErro((e as Error).message);
      }
    };
    void consultar();
    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [id, token]);

  if (erro)
    return (
      <p role="alert" className="text-body text-destructive">
        {erro}
      </p>
    );
  if (!envio || envio.status === "sending") {
    return (
      <p role="status" className="text-body text-muted-foreground">
        Enviando…
      </p>
    );
  }
  if (envio.status === "failed") {
    return (
      <p role="alert" className="text-body text-destructive">
        O envio falhou. Tente de novo em alguns minutos.
      </p>
    );
  }
  const ninguem = envio.successCount === 0 && envio.failureCount > 0;
  const motivos = Object.entries(envio.failureReasons ?? {});
  return (
    <div role="status" className="space-y-1 text-body">
      <p
        className={`font-semibold ${ninguem ? "text-warning" : "text-success"}`}
      >
        {ninguem ? "⚠️" : "✅"} {envio.successCount} entregues ao FCM ·{" "}
        {envio.failureCount} falharam
      </p>
      {motivos.length > 0 && (
        <ul aria-label="Motivos das falhas" className="list-disc pl-5 text-caption">
          {motivos.map(([codigo, n]) => (
            <li key={codigo}>
              <strong>{n}</strong>: {motivoDaFalha(codigo)}.
            </li>
          ))}
        </ul>
      )}
      {envio.pessoas !== undefined && envio.pessoas > 0 && (
        <p className="text-body text-foreground">
          👀 {envio.leram ?? 0} de {envio.pessoas} leram na central do app.
        </p>
      )}
      {/* ⚠️ Texto visível, não tooltip: não é taxa de abertura. */}
      <p className="text-caption text-muted-foreground">
        "Entregue ao FCM" quer dizer que o Google aceitou o envio — não que a
        pessoa viu ou abriu a notificação.
      </p>
    </div>
  );
}
