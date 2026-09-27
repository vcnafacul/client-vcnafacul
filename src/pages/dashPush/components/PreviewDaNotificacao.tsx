import { ReactComponent as Logo } from "@/assets/images/home/logo.svg";

/** Maquete de como a notificação aparece no celular/computador. */
export function PreviewDaNotificacao({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div
      aria-label="Pré-visualização da notificação"
      className="flex gap-3 rounded-2xl bg-slate-800 p-3 text-white shadow-lg"
    >
      <Logo
        aria-hidden
        className="h-10 w-10 shrink-0 rounded-lg bg-white p-1"
      />
      <div className="min-w-0">
        <p className="text-xs text-slate-300">Você na Facul · agora</p>
        <p className="truncate font-semibold">{title || "Título do aviso"}</p>
        <p className="line-clamp-3 text-sm text-slate-200">
          {body || "A mensagem aparece aqui."}
        </p>
      </div>
    </div>
  );
}
