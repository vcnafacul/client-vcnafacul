import { FilterProps } from "@/components/atoms/filter";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ButtonProps } from "../../components/molecules/button";
import { CardDash } from "../../components/molecules/cardDash";
import DashCardTemplate from "../../components/templates/dashCardTemplate";
import { DashCardContext } from "../../context/dashCardContext";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { getRoles } from "../../services/roles/getRoles";
import { getUsersRole } from "../../services/roles/getUsersRole";
import { updateRole } from "../../services/roles/updateRole";
import { useAuthStore } from "../../store/auth";
import { UserRole } from "../../types/roles/UserRole";
import { Role } from "../../types/roles/role";
import { Paginate } from "../../utils/paginate";
import { dashRoles } from "./data";
import ModalNewRole from "./modals/ModalNewRole";
import ModalRole from "./modals/ModalRole";
import ShowUserInfo from "./modals/showUserInfo";

function DashRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [usersRole, setUsersRole] = useState<UserRole[]>([]);
  const [userRoleSelect, setUserRoleSelect] = useState<UserRole | null>();
  const [userModal, setUserModal] = useState<boolean>(false);
  const [userRoleModal, setUserRoleModal] = useState<boolean>(false);
  const [newRole, setnewRole] = useState<boolean>(false);
  const [filterText, setFilterText] = useState<string>("");
  const dataRef = useRef<UserRole[]>([]);
  const limitCards = 40;

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
      { field: "Permissao", value: ur.roleName },
    ],
  });

  const onClickCard = (userId: string) => {
    setUserRoleSelect(usersRole.find((user) => user.user.id === userId));
    setUserModal(true);
  };

  const updateUserRole = (userRole: UserRole) => {
    setUserRoleModal(false);
    updateRole(userRole.user.id, userRole.roleId, token)
      .then(() => {
        setUsersRole(
          usersRole.map((ur) => {
            if (ur.user.id === userRole.user.id) {
              userRole.user.updatedAt = new Date();
              setUserRoleSelect(userRole);
              return userRole;
            }
            return ur;
          })
        );
        toast.success(
          `Atualização da permissão do usuário  ${userRole.user.firstName} feita com sucesso`
        );
      })
      .catch((error: Error) => {
        toast.error(`${error.message} - Usuário ${userRole.user.firstName}`);
      });
  };

  const updateUserLocal = (ur: UserRole) => {
    const newUserRole = usersRole.map((user) => {
      if (user.user.id === ur.user.id) {
        return ur;
      }
      return user;
    });
    setUsersRole(newUserRole);
  };

  const handleNewRole = (role: Role) => {
    const newRoles = [...roles, role];
    setRoles(newRoles);
  };

  const getUsers = () => {
    getUsersRole(token, 1, limitCards, filterText)
      .then((res) => {
        setUsersRole(
          res.data.sort((a, b) =>
            a.user.firstName.localeCompare(b.user.firstName)
          )
        );
        dataRef.current = res.data;
      })
      .catch((error: Error) => {
        toast.error(error.message);
        setUsersRole([]);
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

    getUsers();
  }, [token]);

  const getMoreCards = async (page: number): Promise<Paginate<UserRole>> => {
    return await getUsersRole(token, page, limitCards, filterText);
  };

  const ShowUserRole = () => {
    return !userRoleModal ? null : (
      <ModalRole
        roles={roles.filter((r) => {
          if (r.name !== "Todos") {
            return r;
          }
        })}
        updateUserRole={updateUserRole}
        userRole={userRoleSelect!}
        isOpen={userRoleModal}
        handleClose={() => setUserRoleModal(false)}
      />
    );
  };

  const ShowNewRole = () => {
    return !newRole ? null : (
      <ModalNewRole
        handleNewRole={handleNewRole}
        isOpen={newRole}
        handleClose={() => setnewRole(false)}
      />
    );
  };

  const ShowUserModal = () => {
    return !userModal ? null : (
      <ShowUserInfo
        isOpen={userModal}
        handleClose={() => setUserModal(false)}
        ur={userRoleSelect!}
        updateUser={updateUserLocal}
        openUpdateRole={() => setUserRoleModal(true)}
      />
    );
  };

  const buttons: ButtonProps[] = [
    {
      onClick: () => {
        setUserRoleSelect(null);
        setnewRole(true);
      },
      typeStyle: "quaternary",
      size: "small",
      children: "Nova Permissão",
    },
  ];

  const filterProps: FilterProps = {
    filtrar: (e: React.ChangeEvent<HTMLInputElement>) =>
      setFilterText(e.target.value.toLowerCase()),
    placeholder: "Busque um usuário",
    defaultValue: filterText,
    keyDown: () => getUsers(),
  };

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
        buttons,
        filterProps,
      }}
    >
      <DashCardTemplate />
      <ShowUserModal />
      <ShowUserRole />
      <ShowNewRole />
    </DashCardContext.Provider>
  );
}

export default DashRoles;
