import PermissaoSwitch from "@/components/permissoes/PermissaoSwitch";
import {
  PermissionGroup,
  PermissionType,
} from "@/dtos/roles/permissionHierarchy";
import { CreateRoleDto } from "@/dtos/roles/createRole";
import { toCamelPermission } from "@/utils/permissionKey";

type TabType = PermissionType | "all";

interface PermissionGroupCardProps {
  group: PermissionGroup;
  activeTab: TabType;
  permissions: CreateRoleDto;
  impliedMap: Record<string, boolean>;
  baseRoleMap: Record<string, boolean>;
  onToggle: (key: string, val: boolean) => void;
  disabledTypes?: PermissionType[];
}

function PermissionGroupCard({
  group,
  activeTab,
  permissions,
  impliedMap,
  baseRoleMap,
  onToggle,
  disabledTypes = [],
}: PermissionGroupCardProps) {
  const visibleNodes = group.permissions.filter(
    (n) => activeTab === "all" || n.type === activeTab,
  );

  if (visibleNodes.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-page/50 p-4 flex flex-col gap-3">
      <span className="text-body font-semibold text-foreground">{group.label}</span>
      <div className="flex flex-wrap gap-2">
        {visibleNodes.map((node) => {
          const camelKey = toCamelPermission(node.key);
          const isChecked = !!permissions[camelKey as keyof CreateRoleDto];
          const isImplied = !!impliedMap[camelKey];
          const isFromBase = !!baseRoleMap[camelKey];
          const isDisabled = disabledTypes.includes(node.type);

          return (
            <div key={node.key} className="flex">
              <PermissaoSwitch
                label={node.label}
                checked={isChecked || isFromBase}
                implied={isImplied || isFromBase}
                onChange={(val) => onToggle(camelKey, val)}
                disabled={isDisabled}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PermissionGroupCard;
export type { TabType };
