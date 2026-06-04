import PermissionGroupCard, {
  TabType,
} from "@/components/molecules/permissionGroupCard/PermissionGroupCard";
import { CreateRoleDto } from "@/dtos/roles/createRole";
import {
  PermissionGroup,
  PermissionType,
} from "@/dtos/roles/permissionHierarchy";
import { toCamelPermission } from "@/utils/permissionKey";
import { useMemo, useState } from "react";

interface PermissionHierarchyPanelProps {
  hierarchy: PermissionGroup[];
  permissions: CreateRoleDto;
  baseRoleMap?: Record<string, boolean>;
  onToggle: (key: string, val: boolean) => void;
  defaultTab?: TabType;
  disabledTypes?: PermissionType[];
}

function computeImplied(
  permissions: CreateRoleDto,
  hierarchy: PermissionGroup[],
): Record<string, boolean> {
  const implied: Record<string, boolean> = {};
  for (const group of hierarchy) {
    for (const node of group.permissions) {
      const camelKey = toCamelPermission(node.key);
      if (permissions[camelKey as keyof CreateRoleDto] && node.implies) {
        for (const imp of node.implies) {
          implied[toCamelPermission(imp)] = true;
        }
      }
    }
  }
  return implied;
}

const TABS: { key: TabType; label: string }[] = [
  { key: PermissionType.prepCourse, label: "Cursinho" },
  { key: PermissionType.project, label: "Projeto" },
  { key: "all", label: "Todas" },
];

function PermissionHierarchyPanel({
  hierarchy,
  permissions,
  baseRoleMap = {},
  onToggle,
  defaultTab = PermissionType.prepCourse,
  disabledTypes = [],
}: PermissionHierarchyPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);

  const impliedMap = useMemo(
    () => computeImplied(permissions, hierarchy),
    [permissions, hierarchy],
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-full inline-block"
            style={{ background: "#f97316" }}
          />
          Cursinho habilitado
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-full inline-block"
            style={{ background: "#fdba74" }}
          />
          Cursinho automático
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-full inline-block"
            style={{ background: "#3b82f6" }}
          />
          Projeto habilitado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border border-gray-300 inline-block" />
          Desabilitado
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 self-start">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={[
              "px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150",
              activeTab === tab.key
                ? "bg-white text-marine shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Groups */}
      <div className="flex flex-col gap-3">
        {hierarchy.map((group) => (
          <PermissionGroupCard
            key={group.key}
            group={group}
            activeTab={activeTab}
            permissions={permissions}
            impliedMap={impliedMap}
            baseRoleMap={baseRoleMap}
            onToggle={onToggle}
            disabledTypes={disabledTypes}
          />
        ))}
      </div>
    </div>
  );
}

export default PermissionHierarchyPanel;
