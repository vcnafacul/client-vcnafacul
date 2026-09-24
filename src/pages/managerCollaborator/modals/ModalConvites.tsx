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
import { IconButton } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { useCallback, useEffect, useState } from "react";
import {
  IoArrowUndoOutline,
  IoCheckmarkSharp,
  IoCloseCircleOutline,
  IoPaperPlaneOutline,
} from "react-icons/io5";
import { toast } from "react-toastify";
import { AVISO_REENVIAR, dataCurta, textoDaSituacao } from "./textosDosConvites";

const COR_DA_SITUACAO: Record<ConviteDoCursinho["situacao"], string> = {
  pendente: "bg-amber-100 text-amber-800",
  aceito: "bg-green-100 text-green-800",
  expirado: "bg-gray-100 text-gray-600",
  cancelado: "bg-red-100 text-red-700",
};

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
      className="bg-white p-6 rounded-md"
    >
      <div data-modal-convites className="flex w-[min(92vw,56rem)] flex-col gap-5">
        <header className="text-center">
          <h2 className="text-lg font-bold text-marine">Convites de colaborador</h2>
          <p className="text-sm text-gray-500">
            Convide por email já escolhendo a função. O convite vale 7 dias.
          </p>
        </header>

        <form
          data-novo-convite
          onSubmit={convidar}
          className="grid gap-3 rounded-md border bg-gray-50 p-4 sm:grid-cols-[1fr_14rem_auto] sm:items-end"
        >
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            Email
            <input
              data-email
              type="email"
              required
              placeholder="nome@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-md border bg-white px-3 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            Função
            <select
              data-funcao
              required
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="h-10 rounded-md border bg-white px-2 text-sm"
            >
              <option value="">Escolha a função</option>
              {funcoes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="submit"
            className="h-10"
            disabled={enviando || !email.trim() || !roleId}
          >
            {enviando ? "Enviando…" : "Convidar"}
          </Button>
        </form>

        {carregando ? (
          <p className="text-sm text-gray-500">Carregando…</p>
        ) : convites.length === 0 ? (
          <p data-sem-convites className="py-6 text-center text-sm text-gray-600">
            Nenhum convite enviado ainda.
          </p>
        ) : (
          <div className="max-h-[50vh] overflow-auto">
            <table data-lista-convites className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-white text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2 font-semibold">Convidado</th>
                  <th className="px-3 py-2 font-semibold">Função</th>
                  <th className="px-3 py-2 font-semibold">Situação</th>
                  <th className="px-3 py-2 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {convites.map((c) => (
                  <tr key={c.id} data-convite={c.id} className="border-t align-middle">
                    <td className="max-w-[18rem] px-3 py-3">
                      <p className="truncate font-medium text-gray-900" title={c.email}>
                        {c.email}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        por {c.convidadoPor} · em {dataCurta(c.createdAt)}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      {c.situacao === "pendente" ? (
                        <select
                          data-trocar-funcao={c.id}
                          aria-label={`Função do convite de ${c.email}`}
                          value={c.funcao.id}
                          onChange={(e) =>
                            agir(
                              () => trocarFuncaoDoConvite(token, c.id, e.target.value),
                              "Função do convite alterada.",
                            )
                          }
                          className="h-9 w-full min-w-[9rem] rounded-md border bg-white px-2 text-sm"
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
                    <td className="px-3 py-3">
                      <span
                        data-situacao
                        className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${COR_DA_SITUACAO[c.situacao]}`}
                      >
                        {textoDaSituacao(c)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      {c.situacao === "pendente" &&
                        (confirmarCancelar === c.id ? (
                          <>
                            <Tooltip title="Confirmar cancelamento">
                              <IconButton
                                size="small"
                                color="error"
                                data-confirmar-cancelar={c.id}
                                onClick={async () => {
                                  setConfirmarCancelar(null);
                                  await agir(
                                    () => cancelarConvite(token, c.id),
                                    "Convite cancelado.",
                                  );
                                }}
                              >
                                <IoCheckmarkSharp />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Manter convite">
                              <IconButton
                                size="small"
                                onClick={() => setConfirmarCancelar(null)}
                              >
                                <IoArrowUndoOutline />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <>
                            <Tooltip title={AVISO_REENVIAR}>
                              <IconButton
                                size="small"
                                data-reenviar={c.id}
                                onClick={() =>
                                  agir(
                                    () => reenviarConvite(token, c.id),
                                    "Convite reenviado — o link anterior deixou de valer.",
                                  )
                                }
                              >
                                <IoPaperPlaneOutline />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Cancelar convite">
                              <IconButton
                                size="small"
                                data-cancelar={c.id}
                                onClick={() => setConfirmarCancelar(c.id)}
                              >
                                <IoCloseCircleOutline />
                              </IconButton>
                            </Tooltip>
                          </>
                        ))}
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
