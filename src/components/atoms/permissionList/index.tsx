import { CreateRoleDto } from "@/dtos/roles/createRole";
import { EditRoleDto } from "@/dtos/roles/editRole";
import { RolesLabel } from "@/enums/roles/roles";
import Toggle from "../toggle";

interface PermissionsListProps {
  title: string;
  roles: typeof RolesLabel;
  seletedRole: CreateRoleDto | EditRoleDto | null;
  handleToggleChange: (name: string, checked: boolean) => void;
  disabled?: boolean;
}
export function PermissionsList({
  title,
  roles,
  seletedRole,
  handleToggleChange,
  disabled = false,
}: PermissionsListProps) {
  if (roles.length === 0) return null;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-body font-bold text-foreground mb-6 text-center">
        {title}
      </p>
      <div className="flex justify-between flex-wrap gap-x-6 gap-y-2">
        {roles.map((role, index) => (
          <div key={index} className="flex items-center w-80 gap-4">
            <Toggle
              name={role.value}
              checked={seletedRole ? seletedRole[role.value] : false}
              handleCheck={handleToggleChange}
              disabled={disabled}
            />
            <span className="text-body font-medium text-foreground">
              {role.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
