import ModalConfirmCancel from "@/components/organisms/modalConfirmCancel";
import { Roles } from "@/enums/roles/roles";
import {
  excluirQuestao,
  podeExcluirQuestao,
  type MotivoParaNaoExcluir,
} from "@/services/question/excluirQuestao";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";
import {
  TEXTO_CONFIRMAR_EXCLUSAO,
  TEXTO_EXCLUIR,
  TITULO_CONFIRMAR_EXCLUSAO,
} from "./textoDaLinhagem";

/**
 * Excluir uma questão órfã (card 33).
 *
 * ⚠️ **O botão só aparece quando o servidor diz que pode** — e isso é
 * conveniência, não garantia. Entre a consulta e o clique, alguém pode pôr a
 * questão numa prova; por isso a recusa do `DELETE` é tratada e mostrada.
 *
 * ⚠️ **`excluirQuestao`**, permissão própria e a mesma guarda da api. Sem ela,
 * nem pergunta.
 */
export function ExcluirQuestao({
  questaoId,
  aoExcluir,
}: {
  questaoId: string;
  /** Chamado depois de excluir — quem monta fecha o modal e recarrega a lista. */
  aoExcluir?: () => void;
}) {
  const {
    data: { token, permissao },
  } = useAuthStore();
  const temPermissao = !!permissao[Roles.excluirQuestao];

  const [pode, setPode] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [recusa, setRecusa] = useState<MotivoParaNaoExcluir[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!temPermissao) return;
    let vivo = true;
    /*
      ⚠️ **Falha em silêncio**, como o resto da linhagem: sem resposta, o botão
      simplesmente não aparece — e não aparecer é o lado seguro.
    */
    podeExcluirQuestao(token, questaoId)
      .then((r) => vivo && setPode(r.podeExcluir))
      .catch(() => undefined);
    return () => {
      vivo = false;
    };
  }, [token, questaoId, temPermissao]);

  if (!temPermissao || !pode) return null;

  const fechar = () => {
    setConfirmando(false);
    setRecusa(null);
    setErro(null);
  };

  const confirmar = async () => {
    setExcluindo(true);
    setErro(null);
    try {
      const r = await excluirQuestao(token, questaoId);
      if (r.excluida) {
        setConfirmando(false);
        aoExcluir?.();
      } else {
        setRecusa(r.motivos);
      }
    } catch {
      setErro("Não foi possível excluir a questão. Tente de novo.");
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <>
      <button
        type="button"
        data-excluir
        onClick={() => setConfirmando(true)}
        className="rounded-md border border-red-300 px-2 py-1 text-red-700"
      >
        {TEXTO_EXCLUIR}
      </button>

      <ModalConfirmCancel
        isOpen={confirmando}
        handleClose={fechar}
        handleConfirm={confirmar}
        /* ⚠️ Recusada, confirmar de novo daria a mesma recusa. */
        confirmDisabled={excluindo || recusa !== null}
        text={TITULO_CONFIRMAR_EXCLUSAO}
      >
        {recusa === null ? (
          <p className="text-sm text-gray-700">{TEXTO_CONFIRMAR_EXCLUSAO}</p>
        ) : (
          /*
            ⚠️ **Todos os motivos, e não "não é possível excluir"** — que
            mandaria a pessoa adivinhar. Chega aqui quando a questão mudou
            depois de o botão aparecer.
          */
          <div data-recusa className="text-sm text-gray-700">
            <p className="font-semibold">
              Esta questão não pode mais ser excluída:
            </p>
            <ul className="list-disc pl-5">
              {recusa.map((m) => (
                <li key={m.codigo}>{m.texto}</li>
              ))}
            </ul>
          </div>
        )}
        {erro && <p className="text-sm text-red-700">{erro}</p>}
      </ModalConfirmCancel>
    </>
  );
}
