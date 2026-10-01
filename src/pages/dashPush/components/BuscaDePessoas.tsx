import { buscarDestinatarios, type Destinatario } from "@/services/push/admin";
import { useAuthStore } from "@/store/auth";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

const ESPERA_MS = 300;

function Aparelhos({ devices }: { devices: number }) {
  return devices > 0 ? (
    <span className="text-xs text-green-700">
      {devices === 1 ? "1 aparelho ativo" : `${devices} aparelhos ativos`}
    </span>
  ) : (
    <span className="text-xs text-slate-400">Não ativou as notificações</span>
  );
}

/**
 * "Pessoas específicas": busca por nome ou e-mail, como na tela de usuários,
 * e mostra quem já ativou as notificações. ⚠️ Sem e-mail digitado à mão — um
 * erro de digitação mandaria para ninguém sem aviso.
 */
export function BuscaDePessoas({
  escolhidas,
  onChange,
}: {
  escolhidas: Destinatario[];
  onChange: (pessoas: Destinatario[]) => void;
}) {
  const token = useAuthStore((s) => s.data.token);
  const [texto, setTexto] = useState("");
  const [achadas, setAchadas] = useState<Destinatario[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const termo = texto.trim();
    if (termo.length < 2) {
      setAchadas([]);
      return;
    }
    let cancelado = false;
    const t = setTimeout(async () => {
      setBuscando(true);
      setErro(null);
      try {
        const r = await buscarDestinatarios(termo, token);
        if (!cancelado) setAchadas(r);
      } catch (e) {
        if (!cancelado) setErro((e as Error).message);
      } finally {
        if (!cancelado) setBuscando(false);
      }
    }, ESPERA_MS);
    return () => {
      cancelado = true;
      clearTimeout(t);
    };
  }, [texto, token]);

  const escolher = (p: Destinatario) => {
    if (!escolhidas.some((e) => e.id === p.id)) onChange([...escolhidas, p]);
    setTexto("");
    setAchadas([]);
  };
  const tirar = (id: string) => onChange(escolhidas.filter((e) => e.id !== id));

  return (
    <div className="space-y-2">
      {escolhidas.length > 0 && (
        <ul aria-label="Pessoas escolhidas" className="flex flex-wrap gap-2">
          {escolhidas.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-3 pr-1 text-sm"
            >
              <span className="flex flex-col leading-tight">
                <span>{p.name}</span>
                <Aparelhos devices={p.devices} />
              </span>
              <button
                type="button"
                aria-label={`Tirar ${p.name}`}
                onClick={() => tirar(p.id)}
                className="rounded-full p-1 text-slate-500 hover:bg-slate-200"
              >
                <X aria-hidden className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        aria-label="Buscar pessoa por nome ou e-mail"
        placeholder="Busque por nome, sobrenome ou email"
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-marine/40"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />

      {buscando && <p className="text-xs text-slate-500">Buscando…</p>}
      {erro && (
        <p role="alert" className="text-xs text-red-600">
          {erro}
        </p>
      )}
      {!buscando &&
        texto.trim().length >= 2 &&
        achadas.length === 0 &&
        !erro && <p className="text-xs text-slate-500">Ninguém encontrado.</p>}
      {achadas.length > 0 && (
        <ul
          aria-label="Resultados da busca"
          className="max-h-60 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200"
        >
          {achadas.map((p) => {
            const jaEscolhida = escolhidas.some((e) => e.id === p.id);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  disabled={jaEscolhida}
                  onClick={() => escolher(p)}
                  className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-slate-50 disabled:opacity-50"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs text-slate-500">{p.email}</span>
                  <Aparelhos devices={p.devices} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
