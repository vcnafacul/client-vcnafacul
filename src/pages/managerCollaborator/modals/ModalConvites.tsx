import ModalTemplate from "@/components/templates/modalTemplate";
import { Button } from "@/components/ui/button";
import {
  cancelarConvite,
  criarConvite,
  listarConvites,
  reenviarConvite,
  trocarFuncaoDoConvite,
  type ConviteDoCursinho,
} from "@/services/prepCourse/conviteColaborador";
import { useAuthStore } from "@/store/auth";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AVISO_REENVIAR, dataCurta, textoDaSituacao } from "./textosDosConvites";

interface Funcao {
  id: string;
  name: string;
}

/**
 * Os convites do cursinho (card 06 de `convite-de-colaborador`) — para o admin
 * do cursinho e para quem gerencia colaboradores (corrigido 2026-09-24).
 *
 * ⚠️ As `funcoes` vêm do `role/atribuiveis`: quem não é admin não recebe as
 * funções de administração, e o servidor recusa a escalada de todo jeito.
 *
 * ⚠️ **Convidar já escolhendo a função** — o pedido do cursinho. A pessoa
 * aceita (ou se cadastra) e entra como colaboradora com ela.
 */
export function ModalConvites({
  isOpen,
  handleClose,
  funcoes,
}: {
  isOpen: boolean;
  handleClose: () => void;
  /** As funções do cursinho — as mesmas da tela de Colaboradores. */
  funcoes: Funcao[];
}) {
  const {
    data: { token },
  } = useAuthStore();

  const [convites, setConvites] = useState<ConviteDoCursinho[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [confirmarCancelar, setConfirmarCancelar] = useState<string | null>(null);

  const carregar = useCallback(() => {
    setCarregando(true);
    listarConvites(token)
      .then(setConvites)
      .catch((e: Error) => toast.error(e.message))
      .finally(() => setCarregando(false));
  }, [token]);

  useEffect(carregar, [carregar]);

  /*
    ⚠️ Toda ação mostra a mensagem do SERVIDOR na recusa — "Já existe um
    convite pendente... até 01/10", "já está vinculada a outro cursinho" —, e
    recarrega a lista no sucesso, em vez de remendar o estado local.
  */
  const agir = async (acao: () => Promise<unknown>, sucesso: string) => {
    try {
      await acao();
      toast.success(sucesso);
      carregar();
      return true;
    } catch (e) {
      toast.error((e as Error).message);
      return false;
    }
  };

  const convidar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!email.trim() || !roleId) return;
    setEnviando(true);
    const deu = await agir(
      () => criarConvite(token, email.trim(), roleId),
      "Convite enviado!",
    );
    setEnviando(false);
    if (deu) {
      setEmail("");
      setRoleId("");
    }
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white p-4 rounded-md"
    >
      <div data-modal-convites className="flex w-[min(90vw,48rem)] flex-col gap-4">
        <h2 className="text-center text-base font-bold text-marine">
          Convites de colaborador
        </h2>

        <form
          data-novo-convite
          onSubmit={convidar}
          className="flex flex-wrap items-end gap-2 rounded-md border p-3"
        >
          <label className="flex min-w-[14rem] flex-1 flex-col text-xs text-gray-600">
            Email
            <input
              data-email
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border px-2 py-1 text-sm"
            />
          </label>
          <label className="flex min-w-[10rem] flex-col text-xs text-gray-600">
            Função
            <select
              data-funcao
              required
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="rounded-md border px-2 py-1 text-sm"
            >
              <option value="">Escolha</option>
              {funcoes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" disabled={enviando || !email.trim() || !roleId}>
            {enviando ? "Enviando…" : "Convidar"}
          </Button>
        </form>

        {carregando ? (
          <p className="text-sm text-gray-500">Carregando…</p>
        ) : convites.length === 0 ? (
          <p data-sem-convites className="text-sm text-gray-600">
            Nenhum convite enviado ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table data-lista-convites className="w-full text-left text-sm">
              <thead className="text-xs text-gray-500">
                <tr>
                  <th className="p-2">Email</th>
                  <th className="p-2">Função</th>
                  <th className="p-2">Convidado por</th>
                  <th className="p-2">Enviado em</th>
                  <th className="p-2">Situação</th>
                  <th className="p-2" />
                </tr>
              </thead>
              <tbody>
                {convites.map((c) => (
                  <tr key={c.id} data-convite={c.id} className="border-t">
                    <td className="p-2">{c.email}</td>
                    <td className="p-2">
                      {c.situacao === "pendente" ? (
                        <select
                          data-trocar-funcao={c.id}
                          value={c.funcao.id}
                          onChange={(e) =>
                            agir(
                              () => trocarFuncaoDoConvite(token, c.id, e.target.value),
                              "Função do convite alterada.",
                            )
                          }
                          className="rounded-md border px-1 py-0.5 text-sm"
                        >
                          {funcoes.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        c.funcao.nome
                      )}
                    </td>
                    <td className="p-2">{c.convidadoPor}</td>
                    <td className="p-2">{dataCurta(c.createdAt)}</td>
                    <td className="p-2" data-situacao>
                      {textoDaSituacao(c)}
                    </td>
                    <td className="p-2">
                      {c.situacao === "pendente" && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            data-reenviar={c.id}
                            title={AVISO_REENVIAR}
                            onClick={() =>
                              agir(
                                () => reenviarConvite(token, c.id),
                                "Convite reenviado — o link anterior deixou de valer.",
                              )
                            }
                          >
                            Reenviar
                          </Button>
                          {confirmarCancelar === c.id ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              data-confirmar-cancelar={c.id}
                              onClick={async () => {
                                setConfirmarCancelar(null);
                                await agir(
                                  () => cancelarConvite(token, c.id),
                                  "Convite cancelado.",
                                );
                              }}
                            >
                              Confirmar
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              data-cancelar={c.id}
                              onClick={() => setConfirmarCancelar(c.id)}
                            >
                              Cancelar
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ModalTemplate>
  );
}
