import { PermissionType } from "@/dtos/roles/permissionHierarchy";

interface PermissionToggleProps {
  label: string;
  checked: boolean;
  implied: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  readonly?: boolean; // on but not interactive, no cursor-not-allowed
  type: PermissionType;
}

const COLOR_MAP: Record<
  PermissionType,
  {
    solid: string;
    solidLight: string;
    solidBorder: string;
    solidText: string;
    dot: string;
  }
> = {
  [PermissionType.prepCourse]: {
    solid: "#f97316",
    solidLight: "#ffedd5",
    solidBorder: "#fdba74",
    solidText: "#fb923c",
    dot: "#fdba74",
  },
  [PermissionType.project]: {
    solid: "#3b82f6",
    solidLight: "#dbeafe",
    solidBorder: "#93c5fd",
    solidText: "#60a5fa",
    dot: "#93c5fd",
  },
};

function PermissionToggle({
  label,
  checked,
  implied,
  onChange,
  disabled,
  readonly,
  type,
}: PermissionToggleProps) {
  const isOn = checked || implied;
  const isReadonly = implied || disabled || readonly;
  const COLOR = COLOR_MAP[type];

  const buttonStyle: React.CSSProperties = isOn
    ? implied
      ? {
          background: COLOR.solidLight,
          borderColor: COLOR.solidBorder,
          color: COLOR.solidText,
          cursor: "not-allowed",
        }
      : {
          background: COLOR.solid,
          borderColor: COLOR.solid,
          color: "#ffffff",
          cursor: readonly ? "default" : isReadonly ? "not-allowed" : "pointer",
        }
    : disabled
      ? {
          background: "#f3f4f6",
          borderColor: "#e5e7eb",
          color: "#d1d5db",
          cursor: "not-allowed",
        }
      : readonly
        ? {
            background: "#f9fafb",
            borderColor: "#e5e7eb",
            color: "#9ca3af",
            cursor: "default",
          }
        : {
            background: "#ffffff",
            borderColor: "#e5e7eb",
            color: "#6b7280",
            cursor: "pointer",
          };

  const dotStyle: React.CSSProperties = isOn
    ? implied
      ? { background: COLOR.dot, borderColor: COLOR.dot }
      : { background: "#ffffff", borderColor: "#ffffff" }
    : { background: "transparent", borderColor: "currentColor", opacity: 0.4 };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      onClick={() => !isReadonly && onChange(!checked)}
      style={buttonStyle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200 select-none"
    >
      <span
        style={dotStyle}
        className="w-3.5 h-3.5 rounded-full border transition-all duration-200 flex-shrink-0"
      />
      {label}
      {implied && (
        <span className="text-[10px] font-normal opacity-60 ml-0.5">
          (auto)
        </span>
      )}
    </button>
  );
}

export default PermissionToggle;
