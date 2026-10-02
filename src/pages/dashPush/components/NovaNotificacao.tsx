import { Button } from "@/components/ui/button";
import {
  conferirPublico,
  enviarNotificacao,
  type Alcance,
} from "@/services/push/admin";
import { getRoles } from "@/services/roles/getRoles";
import { useAuthStore } from "@/store/auth";
import type { Role } from "@/types/roles/role";
import { useEffect, useState } from "react";
import {
  LIMITE_CORPO,
  LIMITE_TITULO,
  PALAVRA_DE_CONFIRMACAO,
  RASCUNHO_VAZIO,
  errosDo,
  publicoDo,
  type Rascunho,
  type TipoDePublico,
} from "../regras";
import { AcompanharEnvio } from "./AcompanharEnvio";
import { BuscaDePessoas } from "./BuscaDePessoas";
import { PreviewDaNotificacao } from "./PreviewDaNotificacao";

const TIPOS: { valor: TipoDePublico; rotulo: string }[] = [
  { valor: "roles", rotulo: "Por função" },
  { valor: "emails", rotulo: "Pessoas específicas" },
  { valor: "all", rotulo: "Todos" },
];

const campo =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-marine/40";

function Contador({ atual, limite }: { atual: number; limite: number }) {
  return (
    <span
      className={atual > limite ? "text-red-600" : "text-slate-400"}
      aria-live="polite"
    >
      {atual}/{limite}
    </span>
  );
}

/** Aba "Nova notificação" da tela admin (FE-06). */
export function NovaNotificacao() {
  const token = useAuthStore((s) => s.data.token);
  const [r, setR] = useState<Rascunho>(RASCUNHO_VAZIO);
  const [funcoes, setFuncoes] = useState<Role[]>([]);
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [alcance, setAlcance] = useState<Alcance | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [palavra, setPalavra] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [erroDaApi, setErroDaApi] = useState<string | null>(null);
  const [enviadoId, setEnviadoId] = useState<string | null>(null);

  useEffect(() => {
    getRoles(token)
      // O getRoles põe um "Todos" (id 0) na frente, para filtros.
      .then((res) => setFuncoes(res.data.filter((f) => String(f.id) !== "0")))
      .catch(() => setFuncoes([]));
  }, [token]);

  const erros = errosDo(r);
  const valido = Object.keys(erros).length === 0;
  const mudar = (parcial: Partial<Rascunho>) => {
    setR((atual) => ({ ...atual, ...parcial }));
    setAlcance(null); // mudou algo: o número conferido deixa de valer
    setConfirmando(false);
    setErroDaApi(null);
  };
  const mostrarErro = (k: keyof Rascunho) =>
    tentouEnviar && erros[k] ? (
      <p className="text-xs text-red-600">{erros[k]}</p>
    ) : null;

  const conferir = async () => {
    setTentouEnviar(true);
    if (!valido) return null;
    setOcupado(true);
    setErroDaApi(null);
    try {
      const a = await conferirPublico(publicoDo(r), token);
      setAlcance(a);
      return a;
    } catch (e) {
      setErroDaApi((e as Error).message);
      return null;
    } finally {
      setOcupado(false);
    }
  };

  const abrirConfirmacao = async () => {
    const a = alcance ?? (await conferir());
    if (!a) return;
    setPalavra("");
    setConfirmando(true);
  };

  const enviar = async () => {
    setOcupado(true);
    setErroDaApi(null);
    try {
      const { id } = await enviarNotificacao(
        {
          title: r.title.trim(),
          body: r.body.trim(),
          url: r.url.trim() || undefined,
          audience: publicoDo(r),
        },
        token,
      );
      setEnviadoId(id);
      setConfirmando(false);
    } catch (e) {
      setErroDaApi((e as Error).message);
    } finally {
      setOcupado(false);
    }
  };

  const novoEnvio = () => {
    setR(RASCUNHO_VAZIO);
    setEnviadoId(null);
    setAlcance(null);
    setTentouEnviar(false);
  };

  if (enviadoId) {
    return (
      <div className="space-y-4">
        <AcompanharEnvio id={enviadoId} />
        <Button variant="outline" onClick={novoEnvio}>
          Nova notificação
        </Button>
      </div>
    );
  }

  const paraTodos = r.tipo === "all";
  const podeConfirmar =
    !ocupado && (!paraTodos || palavra === PALAVRA_DE_CONFIRMACAO);

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className="space-y-1">
          <label
            htmlFor="push-titulo"
            className="flex justify-between text-sm font-medium"
          >
            Título{" "}
            <Contador atual={r.title.trim().length} limite={LIMITE_TITULO} />
          </label>
          <input
            id="push-titulo"
            className={campo}
            value={r.title}
            onChange={(e) => mudar({ title: e.target.value })}
          />
          {mostrarErro("title")}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="push-corpo"
            className="flex justify-between text-sm font-medium"
          >
            Mensagem{" "}
            <Contador atual={r.body.trim().length} limite={LIMITE_CORPO} />
          </label>
          <textarea
            id="push-corpo"
            rows={4}
            className={campo}
            value={r.body}
            onChange={(e) => mudar({ body: e.target.value })}
          />
          {mostrarErro("body")}
        </div>

        <div className="space-y-1">
          <label htmlFor="push-link" className="text-sm font-medium">
            Link ao clicar (opcional)
          </label>
          <input
            id="push-link"
            className={campo}
            placeholder="/simulados"
            value={r.url}
            onChange={(e) => mudar({ url: e.target.value })}
          />
          {mostrarErro("url")}
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Quem recebe</legend>
          <div className="flex flex-wrap gap-4">
            {TIPOS.map((t) => (
              <label key={t.valor} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="push-publico"
                  checked={r.tipo === t.valor}
                  onChange={() => mudar({ tipo: t.valor })}
                />
                {t.rotulo}
              </label>
            ))}
          </div>

          {r.tipo === "roles" && (
            <div
              role="group"
              aria-label="Funções"
              className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-3"
            >
              {funcoes.map((f) => (
                <label key={f.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={r.roleIds.includes(f.id)}
                    onChange={(e) =>
                      mudar({
                        roleIds: e.target.checked
                          ? [...r.roleIds, f.id]
                          : r.roleIds.filter((id) => id !== f.id),
                      })
                    }
                  />
                  {f.name}
                </label>
              ))}
            </div>
          )}
          {r.tipo === "emails" && (
            <BuscaDePessoas
              escolhidas={r.pessoas}
              onChange={(pessoas) => mudar({ pessoas })}
            />
          )}
          {mostrarErro("roleIds")}
          {mostrarErro("pessoas")}
        </fieldset>

        {alcance && (
          <p role="status" className="text-sm text-marine">
            Vai chegar em{" "}
            <strong>{alcance.pessoas ?? alcance.targetUsers} pessoas</strong> na
            central do app; {alcance.targetUsers} delas com push (
            {alcance.targetDevices} aparelhos).
          </p>
        )}
        {erroDaApi && (
          <p role="alert" className="text-sm text-red-600">
            {erroDaApi}
          </p>
        )}

        {!confirmando ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={conferir} disabled={ocupado}>
              Conferir público
            </Button>
            <Button onClick={abrirConfirmacao} disabled={ocupado}>
              Enviar
            </Button>
          </div>
        ) : (
          <div
            role="region"
            aria-label="Confirmar envio"
            className="space-y-3 rounded-xl border border-orange/40 bg-orange/5 p-4"
          >
            <p className="text-sm">
              Enviar "<strong>{r.title.trim()}</strong>" para{" "}
              <strong>
                {alcance?.pessoas ?? alcance?.targetUsers} pessoas
              </strong>{" "}
              ({alcance?.targetUsers} com push)? Não dá para desfazer.
            </p>
            {paraTodos && (
              <label className="block space-y-1 text-sm">
                <span>
                  É para <strong>todos</strong>. Digite{" "}
                  <strong>{PALAVRA_DE_CONFIRMACAO}</strong> para confirmar:
                </span>
                <input
                  aria-label="Confirmação"
                  className={campo}
                  value={palavra}
                  onChange={(e) => setPalavra(e.target.value)}
                />
              </label>
            )}
            <div className="flex gap-2">
              <Button onClick={enviar} disabled={!podeConfirmar}>
                Confirmar envio
              </Button>
              <Button variant="ghost" onClick={() => setConfirmando(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>

      <aside className="space-y-2">
        <p className="text-sm font-medium text-slate-600">Pré-visualização</p>
        <PreviewDaNotificacao title={r.title.trim()} body={r.body.trim()} />
      </aside>
    </div>
  );
}
