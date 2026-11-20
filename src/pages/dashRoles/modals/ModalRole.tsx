import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PermissionToggle from "@/components/atoms/permissionToggle/PermissionToggle";
import Select from "../../../components/atoms/select";
import { Button } from "@/components/ui/button";
import { getRoleNew } from "../../../services/roles/getRole";
import { useAuthStore } from "../../../store/auth";
import { Role } from "../../../types/roles/role";
import { PermissionType } from "@/dtos/roles/permissionHierarchy";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { PermissionGroupResponse } from "@/dtos/roles/permission";
import { palette } from "@/lib/palette";

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
      <p className="text-body text-muted-foreground text-center py-4">
        Nenhuma permissão encontrada.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => (
        <div
          key={group.key}
          className="rounded-xl border border-border bg-page/50 p-4 flex flex-col gap-3"
        >
          <span className="text-body font-semibold text-foreground">
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

function ModalRole({
  roles,
  role,
  updateUserRole,
  isOpen,
  handleClose,
}: ModalRoleProps) {
  const [roleInfo, setRoleInfo] = useState<
    PermissionGroupResponse[] | undefined
  >(undefined);
  const [newRole, setNewRole] = useState(role.id);
  const [isEditing, setIsEditing] = useState(false);

  const {
    data: { token },
  } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      setNewRole(role.id);
      setIsEditing(false);
    }
  }, [isOpen, role.id]);

  useEffect(() => {
    if (!newRole) return;

    let cancelled = false;

    setRoleInfo(undefined);

    getRoleNew(newRole, token)
      .then((data) => {
        if (!cancelled) {
          setRoleInfo(data);
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          toast.error(error.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [newRole, token]);

  const updateRole = () => {
    updateUserRole(newRole);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setNewRole(role.id);
    setIsEditing(false);
  };

  const selectedRoleName =
    roles.find((r) => r.id === newRole)?.name ?? role.name;

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent size="lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Permissões do Usuário</DialogTitle>
          <DialogDescription>
            Visualize ou altere o perfil atribuído a este usuário.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-5">
          {/* Role selector */}
          <label className="flex flex-col gap-1">
            <span className="text-caption font-semibold text-muted-foreground uppercase tracking-wide">
              Perfil
            </span>

            {isEditing ? (
              <Select
                options={roles}
                defaultValue={newRole}
                setState={setNewRole}
              />
            ) : (
              <div className="text-body font-semibold text-foreground px-3 py-2 rounded-lg border border-border bg-page">
                {selectedRoleName}
              </div>
            )}
          </label>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-caption text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ background: palette.orange[600] }}
              />
              Cursinho habilitado
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ background: palette.blue[500] }}
              />
              Projeto habilitado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border border-border inline-block" />
              Desabilitado
            </span>
          </div>

          {/* Permissions */}
          <div>
            {roleInfo ? (
              <PermissionReadonlyList groups={roleInfo} />
            ) : (
              <p className="text-body text-muted-foreground text-center py-4">
                Carregando...
              </p>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          {isEditing ? (
            <>
              <Button variant="outline" onClick={cancelEdit}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={updateRole}
                disabled={newRole === role.id}
              >
                Salvar
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              disabled={roles.length === 0}
            >
              Editar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ModalRole;
