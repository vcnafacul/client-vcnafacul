import { useModals } from "@/hooks/useModal";
import { useToastAsync } from "@/hooks/useToastAsync";
import { getMaterias, MateriaDto } from "@/services/content/getMaterias";
import { changeActive } from "@/services/prepCourse/collaborator/change-active";
import { excluirColaborador } from "@/services/prepCourse/collaborator/excluir";
import { Segmented } from "@/pages/dashboard/components/Segmented";
import { ListaDeExMembros } from "./ListaDeExMembros";
import { changeDescription } from "@/services/prepCourse/collaborator/change-description";
import { getTodosOsColaboradores } from "@/services/prepCourse/collaborator/get-collaborator";
import { getCollaboratorFrentesBatch } from "@/services/prepCourse/collaborator/get-collaborator-frentes-batch";
import {
  getPhotoCollaborator,
  isLegacyPhotoKey,
} from "@/services/prepCourse/collaborator/get-photo";
import { getRolesAtribuiveis } from "@/services/prepCourse/getRolesAtribuiveis";
import { atribuirFuncaoColaborador } from "@/services/prepCourse/atribuirFuncaoColaborador";
import { useAuthStore } from "@/store/auth";
import { Role } from "@/types/roles/role";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { DashListTemplate, type DashAction } from "@/components/dashV2";
import type { CardDash } from "@/components/molecules/cardDash";
import { DashCardContext } from "@/context/dashCardContext";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { cn } from "@/lib/utils";
import { dashV2 } from "@/components/dashV2/tokens";
import { colunasDeColaborador } from "./columns";
import ModalEditRole from "./modals/ModalEditRole";
import ModalNewRole from "./modals/ModalNewRole";
import ModalUpdateRoleUser from "./modals/ModalUpdateRoleUser";
import { ShowInfo } from "./modals/showInfo";
import { mensagemDaAtivacao } from "./modals/textosDaAtivacao";
import { ModalConvites } from "./modals/ModalConvites";
import { Roles } from "@/enums/roles/roles";
import { buscarColaboradores } from "./buscaDeColaboradores";

export interface CollaboratorColumns {
  id: string;
  photo: string;
  description: string;
  actived: boolean;
  lastAccess: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: {
    id: string;
    name: string;
  };
}

export default function ManagerCollaborator() {
  const [collaborator, setCollaborator] = useState<CollaboratorColumns[]>([]);
  const [collaboratorSelected, setCollaboratorSelected] =
    useState<CollaboratorColumns | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [collaboratorPhotos, setCollaboratorPhotos] = useState<
    Record<string, string>
  >({});
  const [materias, setMaterias] = useState<MateriaDto[]>([]);
  const [frentesMap, setFrentesMap] = useState<Record<string, string[]>>({});
  const [selectedMateria, setSelectedMateria] = useState<string>("");
  const [selectedFrente, setSelectedFrente] = useState<string>("");
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  /** tickets/040, card 07: colaboradores atuais ou ex-membros. */
  const [aba, setAba] = useState<"colaboradores" | "ex-membros">(
    "colaboradores",
  );

  const modals = useModals([
    "modalConvites",
    "modalShowInfo",
    "modalShowNewRole",
    "modalShowEditRole",
    "modalUserRole",
  ]);

  const {
    data: { token, permissao },
  } = useAuthStore();
  const ehAdminDoCursinho = !!permissao[Roles.gerenciarPermissoesCursinho];

  const executeAsync = useToastAsync();
  const VITE_FTP_PROFILE = import.meta.env.VITE_FTP_PROFILE;

  const frentesForSelectedMateria = useMemo(() => {
    if (!selectedMateria) return [];
    const materia = materias.find((m) => m._id === selectedMateria);
    return materia?.frentes ?? [];
  }, [selectedMateria, materias]);

  const allFrenteIds = useMemo(() => {
    if (!selectedMateria) return [];
    return frentesForSelectedMateria.map((f) => f._id ?? f.id);
  }, [frentesForSelectedMateria, selectedMateria]);

  /** Matéria/Frente e a busca combinam por E — a mesma regra no celular. */
  const filteredCollaborators = useMemo(() => {
    if (!selectedMateria && !selectedFrente)
      return buscarColaboradores(collaborator, busca);

    const porFrente = collaborator.filter((c) => {
      const collabFrentes = frentesMap[c.id];
      if (!collabFrentes || collabFrentes.length === 0) return false;

      if (selectedFrente) {
        return collabFrentes.includes(selectedFrente);
      }
      // Only materia selected — match any frente of that materia
      return collabFrentes.some((fId) => allFrenteIds.includes(fId));
    });
    return buscarColaboradores(porFrente, busca);
  }, [
    collaborator,
    frentesMap,
    selectedMateria,
    selectedFrente,
    allFrenteIds,
    busca,
  ]);

  const handleMateriaChange = (value: string) => {
    setSelectedMateria(value);
    setSelectedFrente("");
  };

  const handleFrenteChange = (value: string) => {
    setSelectedFrente(value);
  };

  const handleClearFilters = () => {
    setSelectedMateria("");
    setSelectedFrente("");
    setBusca("");
  };

  const loadCollaboratorPhoto = async (photoKey: string) => {
    try {
      const blob = await getPhotoCollaborator(photoKey);
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error(`Erro ao carregar foto do colaborador:`, error);
      // Legacy keys (sem prefix /) ainda podem estar no FTP. Novos uploads
      // (com prefix collaborators/) vivem só no R2 — sem fallback FTP.
      if (isLegacyPhotoKey(photoKey)) {
        return `${VITE_FTP_PROFILE}${photoKey}`;
      }
      return "";
    }
  };

  const onClickCard = (userId: string) => {
    const coll = collaborator.find((c) => c.id === userId);
    if (!coll) {
      toast.error("Erro ao tentar visualizar o colaborador");
      return;
    }
    setCollaboratorSelected(coll);
    modals.modalShowInfo.open();
  };

  const handleUpdateUserRole = async (roleId: string) => {
    await executeAsync({
      /*
        ⚠️ Rota do cursinho (card 02 de `convite-de-colaborador`): confere o
        cursinho e não deixa quem só gerencia colaboradores escalar. O
        `user/updateRole` ficou só para a plataforma.
      */
      action: () =>
        atribuirFuncaoColaborador(collaboratorSelected!.userId, roleId, token),
      loadingMessage: "Atualizando permissão...",
      successMessage: "Permissão atualizada com sucesso!",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => {
        setCollaboratorSelected({
          ...collaboratorSelected!,
          role: {
            id: roleId,
            name: roles.find((r) => r.id === roleId)?.name || "",
          },
        });
        const updateCollaborator = collaborator.map((c) => {
          if (c.id === collaboratorSelected?.id) {
            return {
              ...c,
              role: {
                id: roleId,
                name: roles.find((r) => r.id === roleId)?.name || "",
              },
            };
          }
          return c;
        });
        setCollaborator(updateCollaborator);
        modals.modalUserRole.close();
      },
    });
  };

  const handleNewRole = (role: Role) => {
    setRoles([...roles, role]);
  };

  const ModalDeConvites = () => {
    return modals.modalConvites.isOpen ? (
      <ModalConvites
        isOpen={modals.modalConvites.isOpen}
        handleClose={() => modals.modalConvites.close()}
        funcoes={roles}
      />
    ) : null;
  };

  const ModalShowInfo = () => {
    return modals.modalShowInfo.isOpen ? (
      <ShowInfo
        isOpen={modals.modalShowInfo.isOpen}
        handleClose={() => modals.modalShowInfo.close()}
        collaborator={collaboratorSelected!}
        photoUrl={
          collaboratorSelected?.photo
            ? collaboratorPhotos[collaboratorSelected.photo]
            : undefined
        }
        handleActive={handleChangeActive}
        handleExcluir={handleExcluir}
        handleDescription={handleDescription}
        onPhotoUpdated={handlePhotoUpdated}
        onPhotoRemoved={handlePhotoRemoved}
        openUpdateRole={() => {
          if (roles.length === 0) {
            toast.error("Não há funções cadastradas");
            return;
          }
          modals.modalUserRole.open();
        }}
      />
    ) : null;
  };

  const ShowUserRole = () => {
    if (!modals.modalUserRole.isOpen) return null;
    return !modals.modalUserRole.isOpen ? null : (
      <ModalUpdateRoleUser
        roles={roles}
        updateUserRole={handleUpdateUserRole}
        role={collaboratorSelected?.role as Role}
        isOpen={modals.modalUserRole.isOpen}
        handleClose={() => modals.modalUserRole.close()}
      />
    );
  };

  const ModalShowNewRole = () => {
    return modals.modalShowNewRole.isOpen ? (
      <ModalNewRole
        isOpen={modals.modalShowNewRole.isOpen}
        handleClose={() => modals.modalShowNewRole.close()}
        handleNewRole={handleNewRole}
      />
    ) : null;
  };

  const ModalShowEditRole = () => {
    return modals.modalShowEditRole.isOpen ? (
      <ModalEditRole
        isOpen={modals.modalShowEditRole.isOpen}
        handleClose={() => modals.modalShowEditRole.close()}
      />
    ) : null;
  };

  /**
   * Exclui (tickets/040): sai da lista e o modal de detalhes fecha. Devolve se
   * deu certo, para o modal de exclusão fechar só no sucesso.
   */
  const handleExcluir = async (id: string, roleId?: string) => {
    let ok = false;
    await executeAsync({
      action: () => excluirColaborador(token, id, roleId),
      loadingMessage: "Excluindo colaborador...",
      successMessage: (r) =>
        `Colaborador excluído. Perfil depois da saída: ${r.role.name}.`,
      errorMessage: (err: Error) => err.message,
      onSuccess: () => {
        ok = true;
        setCollaborator((prev) => prev.filter((c) => c.id !== id));
        setCollaboratorSelected(null);
        modals.modalShowInfo.close();
      },
    });
    return ok;
  };

  /** Devolve se deu certo, para o modal mexer na chave só no sucesso. */
  const handleChangeActive = async (id: string, actived: boolean) => {
    let ok = false;
    await executeAsync({
      action: () => changeActive(token, id, actived),
      loadingMessage: actived
        ? "Reativando colaborador..."
        : "Inativando colaborador...",
      successMessage: mensagemDaAtivacao,
      errorMessage: (err: Error) => err.message,
      onSuccess: (r) => {
        ok = true;
        const atualiza = (c: CollaboratorColumns) => ({
          ...c,
          actived: r.actived,
          role: r.role ?? c.role,
        });
        setCollaborator((prev) =>
          prev.map((c) => (c.id === id ? atualiza(c) : c)),
        );
        setCollaboratorSelected((prev) =>
          prev && prev.id === id ? atualiza(prev) : prev,
        );
      },
    });
    return ok;
  };

  const handlePhotoUpdated = async (
    collaboratorId: string,
    newPhotoKey: string,
  ) => {
    setCollaborator((prev) =>
      prev.map((c) =>
        c.id === collaboratorId ? { ...c, photo: newPhotoKey } : c,
      ),
    );
    const url = await loadCollaboratorPhoto(newPhotoKey);
    setCollaboratorPhotos((prev) => ({ ...prev, [newPhotoKey]: url }));
    setCollaboratorSelected((prev) =>
      prev && prev.id === collaboratorId
        ? { ...prev, photo: newPhotoKey }
        : prev,
    );
  };

  const handlePhotoRemoved = (collaboratorId: string) => {
    setCollaborator((prev) =>
      prev.map((c) => (c.id === collaboratorId ? { ...c, photo: "" } : c)),
    );
    setCollaboratorSelected((prev) =>
      prev && prev.id === collaboratorId ? { ...prev, photo: "" } : prev,
    );
  };

  const handleDescription = async (id: string, description: string) => {
    const _id = toast.loading("Alterando informação de colaborador...");
    changeDescription(token, id, description)
      .then(() => {
        const collaboratorAux = collaborator.map((c) => {
          if (c.id === id) {
            setCollaboratorSelected({ ...c, description });
            return { ...c, description };
          }
          return c;
        });
        setCollaborator(collaboratorAux);
        toast.update(_id, {
          render: "Informação alterada com sucesso!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      })
      .catch((error: Error) => {
        toast.update(_id, {
          render: error.message,
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      });
  };

  useEffect(() => {
    getTodosOsColaboradores(token)
      .then((lista) => {
        setCollaborator(
          lista.map((col) => ({
            id: col.id,
            photo: col.photo,
            description: col.description,
            actived: col.actived,
            lastAccess: col.user.lastAccess,
            createdAt: col.createdAt,
            updatedAt: col.updatedAt,
            userId: col.user.id,
            name: col.user.name,
            email: col.user.email,
            phone: col.user.phone,
            role: {
              id: col.user.role.id,
              name: col.user.role.name,
            },
          })),
        );
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setCarregando(false));
  }, [token]);

  useEffect(() => {
    getMaterias(token)
      .then(setMaterias)
      .catch(() => setMaterias([]));
    getCollaboratorFrentesBatch(token)
      .then(setFrentesMap)
      .catch(() => setFrentesMap({}));
  }, [token]);

  useEffect(() => {
    /*
      ⚠️ As funções que QUEM ESTÁ LOGADO pode atribuir — filtradas no servidor.
      O `getRoles` exige ser admin do cursinho: quem só gerencia colaboradores
      recebia erro e ficava sem lista.
    */
    getRolesAtribuiveis(token)
      .then((res) => {
        setRoles(res);
      })
      .catch((error: Error) => {
        toast.error(error.message);
        setRoles([]);
      });
  }, []);

  useEffect(() => {
    const loadPhotos = async () => {
      const photoUrls: Record<string, string> = {};

      for (const col of collaborator) {
        if (col.photo) {
          const url = await loadCollaboratorPhoto(col.photo);
          photoUrls[col.photo] = url;
        }
      }

      setCollaboratorPhotos(photoUrls);
    };

    if (collaborator.length > 0) {
      loadPhotos();
    }

    // Cleanup das URLs criadas
    return () => {
      Object.values(collaboratorPhotos).forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [collaborator]);

  const filtrosAtivos =
    (busca ? 1 : 0) + (selectedMateria ? 1 : 0) + (selectedFrente ? 1 : 0);

  /** tickets/040, card 07: colaboradores atuais ou ex-membros. */
  const abas = (
    <div className="flex justify-center sm:justify-start">
      <Segmented
        label="Lista"
        options={[
          { value: "colaboradores", label: "Colaboradores" },
          { value: "ex-membros", label: "Ex-membros" },
        ]}
        value={aba}
        onChange={setAba}
      />
    </div>
  );

  const modais = (
    <>
      {ModalDeConvites()}
      {ModalShowInfo()}
      {ModalShowNewRole()}
      {ShowUserRole()}
      {ModalShowEditRole()}
    </>
  );

  /*
    ⚠️ **Convites: quem gerencia colaboradores também** — corrigido em
    2026-09-24. Esta tela já exige `gerenciarColaboradores`, então a ação
    aparece para todos que chegam aqui; a lista de funções do modal vem do
    `role/atribuiveis`, sem as de admin para quem não é admin, e o servidor
    recusa a escalada.

    ⚠️ **Funções: só o admin do cursinho** (`gerenciarPermissoesCursinho`)
    cria e edita — quem gerencia colaboradores só escolhe uma que já existe.
  */
  const acoes: { primary: DashAction; secondary: DashAction[] } = {
    primary: {
      id: "convites",
      label: "Convites",
      onClick: () => modals.modalConvites.open(),
    },
    secondary: ehAdminDoCursinho
      ? [
          {
            id: "nova-funcao",
            label: "Nova Função",
            onClick: () => modals.modalShowNewRole.open(),
          },
          {
            id: "editar-funcao",
            label: "Editar Função",
            onClick: () => modals.modalShowEditRole.open(),
          },
        ]
      : [],
  };

  // Ex-membros: a mesma moldura do Dash V2, sem a tabela de colaboradores.
  if (aba === "ex-membros") {
    return (
      <div className={cn("min-h-[calc(100vh-76px)]", dashV2.page)}>
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-4 py-6">
          <div
            className={cn(
              "rounded-md border px-4 py-3",
              dashV2.surface,
              dashV2.border,
            )}
          >
            <h1 className={cn("text-lg font-semibold", dashV2.text.primary)}>
              Colaboradores
            </h1>
          </div>
          {abas}
          <ListaDeExMembros />
        </div>
        {modais}
      </div>
    );
  }

  const cardTransformation = (c: CollaboratorColumns): CardDash => ({
    id: c.id,
    title: c.name,
    status: StatusEnum.Approved,
  });

  return (
    <DashCardContext.Provider
      value={{
        title: "Colaboradores",
        entities: filteredCollaborators,
        setEntities: setCollaborator,
        onClickCard,
        // O V2 pagina no client, sobre a lista inteira que já chegou.
        getMoreCards: async () => ({
          data: collaborator,
          page: 1,
          limit: collaborator.length,
          totalItems: collaborator.length,
        }),
        cardTransformation,
        limitCards: Math.max(collaborator.length, 1),
        filterProps: {
          filtrar: (e: React.ChangeEvent<HTMLInputElement>) =>
            setBusca(e.target.value),
          placeholder: "Buscar por nome, email, função ou telefone",
          defaultValue: busca,
        },
        selectFiltes: [
          {
            "aria-label": "Matéria",
            options: [
              { id: "", name: "Todas as matérias" },
              ...materias.map((m) => ({ id: m._id, name: m.nome })),
            ],
            value: selectedMateria,
            setState: handleMateriaChange,
          },
          {
            "aria-label": "Frente",
            disabled: !selectedMateria,
            options: [
              { id: "", name: "Todas as frentes" },
              ...frentesForSelectedMateria.map((f) => ({
                id: f._id ?? f.id,
                name: f.nome,
              })),
            ],
            value: selectedFrente,
            setState: handleFrenteChange,
          },
        ],
      }}
    >
      <DashListTemplate<CollaboratorColumns>
        columns={colunasDeColaborador(collaboratorPhotos)}
        actions={acoes}
        state={carregando ? "loading" : "idle"}
        activeFilterCount={filtrosAtivos}
        onClearFilters={handleClearFilters}
        totalSemFiltro={collaborator.length}
        defaultSort={{ columnId: "nome", direction: "asc" }}
        headerSlot={abas}
        textoVazio="Nenhum colaborador no cursinho ainda. Use Convites para chamar o primeiro."
      />
      {modais}
    </DashCardContext.Provider>
  );
}
