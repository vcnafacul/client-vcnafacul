import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Text from "../../../components/atoms/text";
import Button from "../../../components/molecules/button";
import { RolesResponse, getRole } from "../../../services/roles/getRole";
import { useAuthStore } from "../../../store/auth";
import { Role } from "../../../types/roles/role";

import ModalTemplate from "@/components/templates/modalTemplate";
import { ReactComponent as StatusApproved } from "../../../assets/icons/statusApproved.svg";
import { ReactComponent as StatusRejected } from "../../../assets/icons/statusRejected.svg";
import Select from "../../../components/atoms/select";

interface ModalRoleProps {
  roles: Role[];
  role: Role;
  updateUserRole: (roleId: string) => void;
  handleClose: () => void;
  isOpen: boolean;
}

function PermissionsList({
  permissions,
}: {
  permissions: RolesResponse["permissoes"];
}) {
  if (!permissions || permissions.length === 0) {
    return <Text size="tertiary">Nenhuma permissão encontrada.</Text>;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {permissions
        .filter((p) => p.name != "base")
        .map((perm) => (
          <div
            key={perm.name}
            className="flex items-center justify-between bg-gray-100 p-2 rounded-md shadow"
          >
            <span className="text-base text-marine font-medium">
              {perm.name}
            </span>
            {perm.liberado ? (
              <StatusApproved className="text-green-500" />
            ) : (
              <StatusRejected className="text-red-500" />
            )}
          </div>
        ))}
    </div>
  );
}

function ModalUpdateRoleUser({
  roles,
  role,
  updateUserRole,
  isOpen,
  handleClose,
}: ModalRoleProps) {
  const [roleInfo, setRoleInfo] = useState<RolesResponse | undefined>(
    undefined
  );
  const first: Role | undefined = roles.find((r) => r.id === role.id);
  const [newRole, setNewRole] = useState<string>(first?.id ?? roles[0].id);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const {
    data: { token },
  } = useAuthStore();

  const updateRole = async () => {
    updateUserRole(newRole);
    setIsEditing(false);
  };

  const cameBackRole = () => {
    setIsEditing(false);
    setNewRole(role.id);
  };

  useEffect(() => {
    getRole(newRole, token)
      .then((res) => {
        setRoleInfo(res);
      })
      .catch((error: Error) => {
        toast.error(error.message);
        setRoleInfo(undefined);
      });
  }, [newRole, token]);

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white rounded-md p-6 shadow-lg max-w-7xl"
    >
      <div className="flex flex-col gap-6">
        <div>
          <Text size="secondary" className="font-bold">
            Permissões
          </Text>
          {isEditing ? (
            <div className="flex justify-center mb-4">
              <Select
                options={roles}
                defaultValue={newRole}
                setState={setNewRole}
              />
            </div>
          ) : (
            <Text size="tertiary" className="text-marine font-black mb-4">
              {roles.find((r) => r.id === newRole)?.name}
            </Text>
          )}
          <PermissionsList permissions={roleInfo?.permissoes || []} />
        </div>

        <div className="flex gap-4 justify-end">
          {isEditing ? (
            <>
              <Button typeStyle="primary" onClick={updateRole}>
                Salvar
              </Button>
              <Button typeStyle="secondary" onClick={cameBackRole}>
                Cancelar
              </Button>
            </>
          ) : (
            <Button
              typeStyle="secondary"
              onClick={() => setIsEditing(true)}
              disabled={roles.length === 0}
            >
              Editar
            </Button>
          )}
        </div>
      </div>
    </ModalTemplate>
  );
}

export default ModalUpdateRoleUser;
