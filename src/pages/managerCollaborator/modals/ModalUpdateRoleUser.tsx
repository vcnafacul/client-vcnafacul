import ModalTemplate from "@/components/templates/modalTemplate";
import PermissionToggle from "@/components/atoms/permissionToggle/PermissionToggle";
import Select from "../../../components/atoms/select";
import Text from "../../../components/atoms/text";
import Button from "../../../components/molecules/button";
import { getRoleNew } from "../../../services/roles/getRole";
import { useAuthStore } from "../../../store/auth";
import { Role } from "../../../types/roles/role";
import { PermissionType } from "@/dtos/roles/permissionHierarchy";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { PermissionGroupResponse } from "@/dtos/roles/permission";

interface ModalRoleProps {
  roles: Role[];
  role: Role;
  updateUserRole: (roleId: string) => void;
  handleClose: () => void;
  isOpen: boolean;
}

function PermissionReadonlyList({
  groups,
}: {
  groups: PermissionGroupResponse[];
}) {
  if (!groups || groups.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">
        Nenhuma permissão encontrada.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => (
        <div
          key={group.key}
          className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 flex flex-col gap-3"
        >
          <span className="text-sm font-semibold text-gray-700">
            {group.label}
          </span>
          <div className="flex flex-wrap gap-2">
            {group.permissions.map((node) => (
              <PermissionToggle
                key={node.key}
                label={node.label}
                checked={node.value}
                implied={false}
                onChange={() => {}}
                readonly
                type={node.type as PermissionType}
              />
            ))}
          </div>
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
  const [roleInfo, setRoleInfo] = useState<
    PermissionGroupResponse[] | undefined
  >(undefined);
  const [newRole, setNewRole] = useState<string>(
    roles.find((r) => r.id === role.id)?.id ?? roles[0]?.id,
  );
  const [isEditing, setIsEditing] = useState(false);

  const {
    data: { token },
  } = useAuthStore();

  const updateRole = () => {
    updateUserRole(newRole);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setRoleInfo(undefined); // clear stale data immediately
    setNewRole(role.id); // reset triggers useEffect re-fetch
  };

  useEffect(() => {
    if (!newRole) return;

    let cancelled = false;
    setRoleInfo(undefined);

    getRoleNew(newRole, token)
      .then((data) => {
        if (!cancelled) setRoleInfo(data);
      })
      .catch((error: Error) => {
        if (!cancelled) toast.error(error.message);
      });

    return () => {
      cancelled = true;
    };
  }, [newRole, token]);

  const selectedRoleName = roles.find((r) => r.id === newRole)?.name;

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose}
      className="bg-white rounded-xl p-5 shadow-lg"
    >
      <div className="w-[92vw] max-w-2xl flex flex-col gap-5 max-h-[80vh]">
        {/* Header */}
        <div>
          <Text size="secondary" className="font-bold text-marine">
            Permissões do Usuário
          </Text>
          <p className="text-sm text-gray-400 mt-0.5">
            Visualize ou altere o perfil atribuído a este usuário.
          </p>
        </div>

        {/* Role selector */}
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Perfil
          </span>
          {isEditing ? (
            <Select
              options={roles}
              defaultValue={newRole}
              setState={setNewRole}
            />
          ) : (
            <div className="text-sm font-semibold text-marine px-3 py-2 rounded-lg border border-gray-200 bg-gray-50">
              {selectedRoleName}
            </div>
          )}
        </label>

        {/* Permissions */}
        <div className="overflow-y-auto scrollbar-hide pr-1">
          {roleInfo ? (
            <PermissionReadonlyList groups={roleInfo} />
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">
              Carregando...
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          {isEditing ? (
            <>
              <Button typeStyle="primary" onClick={cancelEdit}>
                Cancelar
              </Button>
              <Button typeStyle="secondary" onClick={updateRole}>
                Salvar
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
