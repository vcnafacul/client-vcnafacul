import { Button } from "@/components/ui/button";
import { listarEnvios, type Envio } from "@/services/push/admin";
import { getRoles } from "@/services/roles/getRoles";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";
import { descricaoDoPublico } from "../regras";

export const POR_PAGINA = 20;

const STATUS: Record<Envio["status"], string> = {
  sending: "Enviando",
  done: "Concluído",
  failed: "Falhou",
};

/** Aba "Histórico" da tela admin (FE-06). */
export function Historico() {
  const token = useAuthStore((s) => s.data.token);
  const [pagina, setPagina] = useState(1);
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [total, setTotal] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [nomes, setNomes] = useState<Record<string, string>>({});

  // O histórico guarda os ids das funções; a tabela mostra os nomes.
  useEffect(() => {
    getRoles(token)
      .then((r) =>
        setNomes(Object.fromEntries(r.data.map((f) => [String(f.id), f.name]))),
      )
      .catch(() => setNomes({}));
  }, [token]);

  useEffect(() => {
    let ativo = true;
    listarEnvios(token, pagina, POR_PAGINA)
      .then((r) => {
        if (!ativo) return;
        setEnvios(r.data);
        setTotal(r.totalItems);
      })
      .catch((e: Error) => ativo && setErro(e.message));
    return () => {
      ativo = false;
    };
  }, [token, pagina]);

  const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  if (erro)
    return (
      <p role="alert" className="text-sm text-red-600">
        {erro}
      </p>
    );
  if (!envios.length) {
    return (
      <p className="text-sm text-slate-500">
        Nenhuma notificação enviada ainda.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr>
              <th className="py-2 pr-3">Data</th>
              <th className="py-2 pr-3">Título</th>
              <th className="py-2 pr-3">Público</th>
              <th className="py-2 pr-3">Enviado por</th>
              <th className="py-2 pr-3">Status</th>
              <th
                className="py-2 pr-3"
                title="Entregue ao FCM não é lida nem exibida"
              >
                Entregues / falhas
              </th>
            </tr>
          </thead>
          <tbody>
            {envios.map((e) => (
              <tr key={e.id} className="border-t border-slate-100">
                <td className="py-2 pr-3 whitespace-nowrap">
                  {new Date(e.createdAt).toLocaleString("pt-BR")}
                </td>
                <td className="py-2 pr-3">{e.title}</td>
                <td className="py-2 pr-3">
                  {descricaoDoPublico(
                    e.audience,
                    (id) => nomes[id] ?? "função removida",
                  )}
                </td>
                <td className="py-2 pr-3">{e.sentBy?.name ?? "Sistema"}</td>
                <td className="py-2 pr-3">{STATUS[e.status]}</td>
                <td className="py-2 pr-3">
                  {e.successCount} / {e.failureCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">
        "Entregues" = aceitas pelo FCM; não quer dizer que foram lidas.
      </p>
      {paginas > 1 && (
        <div className="flex items-center gap-2 text-sm">
          <Button
            variant="outline"
            size="sm"
            disabled={pagina === 1}
            onClick={() => setPagina((p) => p - 1)}
          >
            Anterior
          </Button>
          <span>
            Página {pagina} de {paginas}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagina >= paginas}
            onClick={() => setPagina((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
