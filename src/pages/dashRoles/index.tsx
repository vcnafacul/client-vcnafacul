import { FilterProps } from "@/components/atoms/filter";
import { SelectProps } from "@/components/atoms/select";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { CardDash } from "../../components/molecules/cardDash";
import { DashListTemplate, type DashAction } from "@/components/dashV2";
import { colunasDeUsuario } from "./columns";
import { DashCardContext } from "../../context/dashCardContext";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { getRoles } from "../../services/roles/getRoles";
import { getUsersRole } from "../../services/roles/getUsersRole";
import { updateUserRole } from "../../services/roles/updateUserRole";
import { useAuthStore } from "../../store/auth";
import { UserRole } from "../../types/roles/UserRole";
import { Role } from "../../types/roles/role";
import { Paginate } from "../../utils/paginate";
import { dashRoles } from "./data";
import ModalEditRole from "./modals/ModalEditRole";
import ModalNewRole from "./modals/ModalNewRole";
import ModalRole from "./modals/ModalRole";
import ModalSendEmail from "./modals/ModalSendEmail";
import ShowUserInfo from "./modals/showUserInfo";
import { useModals } from "@/hooks/useModal";

function DashRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [usersRole, setUsersRole] = useState<UserRole[]>([]);
  const [userRoleSelect, setUserRoleSelect] = useState<UserRole | null>();
  const [filterText, setFilterText] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("0");
  const dataRef = useRef<UserRole[]>([]);
  /*
    ⚠️ **1000, o teto da api** (card 03 de `tela-de-usuarios`). O V2 pagina no
    CLIENTE, sobre o conjunto que chegou — não pede a próxima página ao rolar,
    como o V1 fazia. Com a busca dando match (card 02), 1000 é muito; se
    passar, a tela avisa em vez de esconder.
  */
  const limitCards = 1000;
  const [carregando, setCarregando] = useState(false);
  /** Já houve busca? Antes dela a tela está vazia de propósito. */
  const [buscou, setBuscou] = useState(false);
  const [totalNoServidor, setTotalNoServidor] = useState(0);

  const modals = useModals([
    "modalUserRole",
    "modalNewRole",
    "modalEditRole",
    "modalSendEmail",
    "modalUserModal",
  ]);

  const {
    data: { token },
  } = useAuthStore();
  const cardTransformation = (ur: UserRole): CardDash => ({
    id: ur.user.id,
    title: ur.user.firstName + " " + ur.user.lastName,
    status: ur.user.deletedAt ? StatusEnum.Rejected : StatusEnum.Approved,
    infos: [
      { field: "Email", value: ur.user.email },
      { field: "Telefone", value: ur.user.phone },
      { field: "Função", value: ur.roleName },
    ],
  });

  const onClickCard = (userId: string) => {
    setUserRoleSelect(usersRole.find((user) => user.user.id === userId));
    modals.modalUserRole.open();
  };

  const handleUpdateUserRole = (roleId: string) => {
    if (!userRoleSelect) return;

    updateUserRole(userRoleSelect.user.id, roleId, token)
      .then(() => {
        const updatedUserRole: UserRole = {
          ...userRoleSelect,
          roleId,
          roleName: roles.find((r) => r.id === roleId)?.name ?? "",
        };
        updatedUserRole.user.updatedAt = new Date();

        setUsersRole(
          usersRole.map((ur) =>
            ur.user.id === userRoleSelect.user.id ? updatedUserRole : ur,
          ),
        );
        setUserRoleSelect(updatedUserRole);
        modals.modalUserRole.close();

        toast.success(
          `Atualização da permissão do usuário ${userRoleSelect.user.firstName} feita com sucesso`,
        );
      })
      .catch((error: Error) => {
        toast.error(
          `${error.message} - Usuário ${userRoleSelect.user.firstName}`,
        );
      });
  };

  const handleNewRole = (role: Role) => {
    const newRoles = [...roles, role];
    setRoles(newRoles);
  };

  const activeRoleId = roleFilter !== "0" ? roleFilter : "";

  /*
    ⚠️ **Sem reordenar aqui.** Antes o client ordenava por primeiro nome só a
    página que chegava — com paginação, isso mentia. Agora a ordenação é a da
    tabela, sobre o conjunto inteiro.

    ⚠️ Recebe o texto por parâmetro: no Enter, o estado `filterText` ainda
    pode estar no valor anterior (o campo do V2 tem debounce).
  */
  const getUsers = (texto: string = filterText) => {
    setCarregando(true);
    getUsersRole(token, 1, limitCards, texto, activeRoleId)
      .then((res) => {
        setUsersRole(res.data ?? []);
        setTotalNoServidor(res.totalItems ?? res.data?.length ?? 0);
        dataRef.current = res.data;
      })
      .catch((error: Error) => {
        toast.error(error.message);
        setUsersRole([]);
        setTotalNoServidor(0);
      })
      .finally(() => {
        setCarregando(false);
        setBuscou(true);
      });
  };

  useEffect(() => {
    getRoles(token)
      .then((res) => {
        setRoles(res.data);
      })
      .catch((error: Error) => {
        toast.error(error.message);
        setRoles([]);
      });
  }, [token]);

  const getMoreCards = async (page: number): Promise<Paginate<UserRole>> => {
    return await getUsersRole(
      token,
      page,
      limitCards,
      filterText,
      activeRoleId,
    );
  };

  const ShowUserRole = () => {
    if (!modals.modalUserRole.isOpen || !userRoleSelect) return null;

    const currentRole: Role = {
      id: userRoleSelect.roleId,
      name: userRoleSelect.roleName,
    };

    return (
      <ModalRole
        roles={roles.filter((r) => r.name !== "Todos")}
        updateUserRole={handleUpdateUserRole}
        role={currentRole}
        isOpen={modals.modalUserRole.isOpen}
        handleClose={() => modals.modalUserRole.close()}
      />
    );
  };

  const ShowNewRole = () => {
    return !modals.modalNewRole.isOpen ? null : (
      <ModalNewRole
        handleNewRole={handleNewRole}
        isOpen={modals.modalNewRole.isOpen}
        handleClose={() => modals.modalNewRole.close()}
      />
    );
  };

  const ShowEditRole = () => {
    return !modals.modalEditRole.isOpen ? null : (
      <ModalEditRole
        isOpen={modals.modalEditRole.isOpen}
        handleClose={() => modals.modalEditRole.close()}
      />
    );
  };

  const ShowSendEmailModal = () => {
    return !modals.modalSendEmail.isOpen ? null : (
      <ModalSendEmail
        isOpen={modals.modalSendEmail.isOpen}
        handleClose={() => modals.modalSendEmail.close()}
      />
    );
  };

  const ShowUserModal = () => {
    return !modals.modalUserModal.isOpen ? null : (
      <ShowUserInfo
        isOpen={modals.modalUserModal.isOpen}
        handleClose={() => modals.modalUserModal.close()}
        ur={userRoleSelect!}
        openUpdateRole={() => modals.modalUserRole.open()}
      />
    );
  };

  const selectFiltes: SelectProps[] = roles.length
    ? [
        {
          options: roles.map((r) => ({ id: r.id, name: r.name })),
          defaultValue: roleFilter,
          setState: setRoleFilter,
        },
      ]
    : [];


  const filterProps: FilterProps = {
    filtrar: (e: React.ChangeEvent<HTMLInputElement>) =>
      setFilterText(e.target.value),
    placeholder: "Busque por nome, sobrenome ou email",
    defaultValue: filterText,
    keyDown: () => getUsers(),
  };

  /*
    ⚠️ **As mesmas quatro ações de antes**, agora por papel: buscar é a
    primária; as de função e email, secundárias.
  */
  const acoes: {
    primary: DashAction;
    secondary: DashAction[];
  } = {
    primary: { id: "buscar", label: "Buscar", onClick: () => getUsers() },
    secondary: [
      {
        id: "nova-funcao",
        label: "Nova Função",
        onClick: () => {
          setUserRoleSelect(null);
          modals.modalNewRole.open();
        },
      },
      {
        id: "editar-funcoes",
        label: "Editar Funções",
        onClick: () => modals.modalEditRole.open(),
      },
      {
        id: "enviar-email",
        label: "Enviar Email",
        onClick: () => modals.modalSendEmail.open(),
      },
    ],
  };

  /*
    ⚠️ Passou do teto: avisar, e não cortar calado. Com a busca por palavras,
    é raro — mas "só a função" (sem nome) pode passar.
  */
  const aviso =
    totalNoServidor > usersRole.length ? (
      <p data-aviso-limite className="px-4 py-2 text-xs text-gray-600">
        Mostrando {usersRole.length} de {totalNoServidor} — refine a busca para
        ver os demais.
      </p>
    ) : undefined;

  return (
    <DashCardContext.Provider
      value={{
        title: dashRoles.title,
        entities: usersRole,
        setEntities: setUsersRole,
        onClickCard,
        getMoreCards,
        cardTransformation,
        limitCards,
        selectFiltes,
        filterProps,
      }}
    >
      {/*
        ⚠️ **Continua sem trazer nada de início** — decisão do card 03: a
        tabela só enche com o que der match. O vazio antes da busca convida a
        buscar; depois dela, diz que não achou.
      */}
      <DashListTemplate<UserRole>
        columns={colunasDeUsuario}
        actions={acoes}
        state={carregando ? "loading" : "idle"}
        headerSlot={aviso}
        defaultSort={{ columnId: "nome", direction: "asc" }}
        onSearchSubmit={(texto) => getUsers(texto)}
        textoVazio={
          buscou
            ? "Nenhum usuário encontrado para esta busca."
            : "Busque por nome, sobrenome ou email."
        }
      />
      <ShowUserModal />
      <ShowUserRole />
      <ShowNewRole />
      <ShowEditRole />
      <ShowSendEmailModal />
    </DashCardContext.Provider>
  );
}

export default DashRoles;
