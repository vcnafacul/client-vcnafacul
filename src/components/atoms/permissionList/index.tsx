import { CreateRoleDto } from "@/dtos/roles/createRole";
import { EditRoleDto } from "@/dtos/roles/editRole";
import { RolesLabel } from "@/enums/roles/roles";
import Text from "../text";
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
      <Text size="tertiary" className="font-bold text-marine">
        {title}
      </Text>
      <div className="flex justify-between flex-wrap gap-x-6 gap-y-2">
        {roles.map((role, index) => (
          <div key={index} className="flex items-center w-80 gap-4">
            <Toggle
              name={role.value}
              checked={seletedRole ? seletedRole[role.value] : false}
              handleCheck={handleToggleChange}
              disabled={disabled}
            />
            <span className="text-base font-medium text-marine">
              {role.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
