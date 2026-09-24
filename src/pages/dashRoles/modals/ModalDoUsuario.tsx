import ModalTemplate from "@/components/templates/modalTemplate";
import { useEffect, useState } from "react";
import Button from "../../../components/molecules/button";
import Text from "../../../components/atoms/text";
import {
  getResumoDoUsuario,
  type InscricaoDoResumo,
  type ResumoDoUsuario,
} from "../../../services/roles/getResumoDoUsuario";
import { useAuthStore } from "../../../store/auth";
import { dataBR } from "./dataBR";

interface ModalDoUsuarioProps {
  userId: string;
  /**
   * ⚠️ A função vem do PAI, não do resumo: depois de "Alterar função", o pai
   * atualiza a linha e a seção muda sem buscar de novo nem fechar o modal.
   */
  funcao: string;
  openUpdateRole: () => void;
  isOpen: boolean;
  handleClose: () => void;
}

function Campo({ nome, valor }: { nome: string; valor: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {nome}
      </span>
      <span className="text-sm text-marine break-words">{valor || "—"}</span>
    </div>
  );
}

function Secao({
  titulo,
  id,
  children,
}: {
  titulo: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section
      data-secao={id}
      className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4"
    >
      <h3 className="text-sm font-bold text-marine">{titulo}</h3>
      {children}
    </section>
  );
}

const Vazio = ({ texto }: { texto: string }) => (
  <p className="text-sm text-gray-400">{texto}</p>
);

function ListaDeInscricoes({
  inscricoes,
  comStatus,
}: {
  inscricoes: InscricaoDoResumo[];
  comStatus: boolean;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {inscricoes.map((i, n) => (
        <li
          key={`${i.processo?.id ?? "sem-processo"}-${n}`}
          className="grid grid-cols-1 gap-2 rounded-lg bg-gray-50 p-3 sm:grid-cols-2"
        >
          <Campo nome="Cursinho" valor={i.cursinho?.nome} />
          <Campo nome="Processo" valor={i.processo?.nome} />
          {comStatus ? (
            <>
              <Campo nome="Status" valor={i.status} />
              <Campo nome="Data" valor={dataBR(i.em)} />
            </>
          ) : (
            <Campo nome="Turma" valor={i.turma} />
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * O modal do usuário (card 05 de `tela-de-usuarios`): o resumo do card 04 em
 * cinco seções, com a troca de função como um passo dentro dele. Substitui o
 * antigo `showUserInfo`.
 */
function ModalDoUsuario({
  userId,
  funcao,
  openUpdateRole,
  isOpen,
  handleClose,
}: ModalDoUsuarioProps) {
  const [resumo, setResumo] = useState<ResumoDoUsuario | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const {
    data: { token },
  } = useAuthStore();

  useEffect(() => {
    if (!isOpen) return;
    let cancelado = false;
    setResumo(null);
    setErro(null);
    getResumoDoUsuario(userId, token)
      .then((r) => !cancelado && setResumo(r))
      .catch((e: Error) => !cancelado && setErro(e.message));
    return () => {
      cancelado = true;
    };
  }, [isOpen, userId, token]);

  const conteudo = () => {
    if (erro) return <Vazio texto={erro} />;
    if (!resumo) return <Vazio texto="Carregando..." />;
    const { conta, colaborador, estudante } = resumo;
    return (
      <>
        <Secao titulo="Conta" id="conta">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Campo nome="Nome" valor={conta.nome} />
            {conta.nomeSocial && (
              <Campo
                nome={conta.usaNomeSocial ? "Nome social (em uso)" : "Nome social"}
                valor={conta.nomeSocial}
              />
            )}
            <Campo nome="Email" valor={conta.email} />
            <Campo nome="Telefone" valor={conta.telefone} />
            <Campo
              nome="Cidade/UF"
              valor={[conta.cidade, conta.uf].filter(Boolean).join(" / ")}
            />
            <Campo nome="Cadastrado em" valor={dataBR(conta.cadastradoEm)} />
            <Campo
              nome="Último acesso"
              valor={conta.ultimoAcesso ? dataBR(conta.ultimoAcesso, true) : "Nunca"}
            />
            <Campo
              nome="Email confirmado"
              valor={conta.emailConfirmado ? "Sim" : "Não"}
            />
            {conta.desativada && (
              <Campo nome="Situação" valor="Conta desativada" />
            )}
          </div>
        </Secao>

        <Secao titulo="Função" id="funcao">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-semibold text-marine">
              {funcao || "—"}
            </span>
            <Button typeStyle="secondary" onClick={openUpdateRole}>
              Alterar função
            </Button>
          </div>
        </Secao>

        <Secao titulo="Colaborador" id="colaborador">
          {colaborador ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Campo nome="Cursinho" valor={colaborador.cursinho?.nome} />
              <Campo
                nome="Situação"
                valor={colaborador.ativo ? "Ativo" : "Inativo"}
              />
              <Campo nome="Desde" valor={dataBR(colaborador.desde)} />
            </div>
          ) : (
            <Vazio texto="Não é colaborador." />
          )}
        </Secao>

        <Secao titulo="Estudante — atual" id="estudante-atual">
          {estudante.atual.length ? (
            <ListaDeInscricoes inscricoes={estudante.atual} comStatus={false} />
          ) : (
            <Vazio texto="Não está matriculado." />
          )}
        </Secao>

        <Secao titulo="Estudante — histórico" id="estudante-historico">
          {estudante.historico.length ? (
            <ListaDeInscricoes inscricoes={estudante.historico} comStatus />
          ) : (
            <Vazio texto="Sem outras inscrições." />
          )}
        </Secao>
      </>
    );
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white rounded-xl p-5 shadow-lg"
    >
      <div className="flex w-[92vw] max-w-3xl flex-col gap-4">
        <Text size="secondary" className="font-bold text-marine">
          Usuário
        </Text>
        {conteudo()}
      </div>
    </ModalTemplate>
  );
}

export default ModalDoUsuario;
