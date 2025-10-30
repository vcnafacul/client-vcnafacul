import { PermissionsList } from "@/components/atoms/permissionList";
import Toggle from "@/components/atoms/toggle";
import { EditRoleDto } from "@/dtos/roles/editRole";
import { useToastAsync } from "@/hooks/useToastAsync";
import { getAllRoles } from "@/services/roles/getAll";
import { updateRole } from "@/services/roles/updateRole";
import { useEffect, useState } from "react";
import Button from "../../../components/molecules/button";
import ModalTemplate, {
  ModalProps,
} from "../../../components/templates/modalTemplate";
import { RolesLabel } from "../../../enums/roles/roles";
import { useAuthStore } from "../../../store/auth";

interface ModalEditRoleProps extends ModalProps {
  isOpen: boolean;
}

function ModalEditRole({ handleClose, isOpen }: ModalEditRoleProps) {
  const [roles, setRoles] = useState<EditRoleDto[]>([]);
  const [roleSelected, setRoleSelected] = useState<EditRoleDto | null>(null);

  const executeAsync = useToastAsync();

  const {
    data: { token },
  } = useAuthStore();

  const handleToggleChange = (name: string, checked: boolean) => {
    setRoleSelected({ ...roleSelected!, [name]: checked });
  };

  const editRole = async () => {
    if (!roleSelected) return;

    await executeAsync({
      action: () => updateRole(token, roleSelected!),
      loadingMessage: "Atualizando perfil...",
      successMessage: "Perfil atualizado com sucesso!",
      errorMessage: (error: Error) => error.message,
      onSuccess: () => {
        handleClose!();
      },
    });
  };

  useEffect(() => {
    getAllRoles(token).then((roles) => {
      if (roles.length > 0) {
        setRoleSelected(roles[0]);
      }
      setRoles(roles);
    });
  }, []);

  return (
    <ModalTemplate
      isOpen={isOpen}
      handleClose={handleClose!}
      className="bg-white rounded-md p-4"
    >
      <div className="w-[90vw] h-fit max-h-[70vh] overflow-y-auto scrollbar-hide">
        {/* Nome do Perfil */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 flex-wrap w-full">
            <select
              className="remove-arrow w-full h-full text-lg font-black text-marine pl-4 pr-10 py-1 rounded-xl shadow-md z-50"
              id="demo-simple-select"
              value={roleSelected?.id}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setRoleSelected(
                  roles.find((item) => item.id === e.target.value)!
                );
              }}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Toggle
                name="base"
                checked={roleSelected?.base || false}
                handleCheck={handleToggleChange}
              />
              <span className="text-base font-medium text-marine">
                Perfil Base
              </span>
            </div>
          </div>
        </div>

        {/* Permissões */}
        <PermissionsList
          title="Permissões do Projeto"
          roles={RolesLabel.filter((role) => role.isProjectPermission)}
          seletedRole={roleSelected}
          handleToggleChange={handleToggleChange}
        />
        <div className="border-b border-gray-200 pt-3 mb-3" />
        <PermissionsList
          title="Permissões do Cursinho"
          roles={RolesLabel.filter((role) => !role.isProjectPermission)}
          seletedRole={roleSelected}
          handleToggleChange={handleToggleChange}
        />
      </div>

      {/* Botões */}
      <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
        <Button typeStyle="primary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button
          typeStyle="secondary"
          disabled={!roleSelected?.name.trim()}
          onClick={editRole}
        >
          Salvar
        </Button>
      </div>
    </ModalTemplate>
  );
}

export default ModalEditRole;
