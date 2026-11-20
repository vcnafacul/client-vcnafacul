import { PermissionType } from "@/dtos/roles/permissionHierarchy";
import { palette } from "@/lib/palette";

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
    solid: palette.orange[500],
    solidLight: palette.orange[200],
    solidBorder: palette.orange[400],
    solidText: palette.orange[400],
    dot: palette.orange[400],
  },
  [PermissionType.project]: {
    solid: palette.blue[500],
    solidLight: palette.blue[200],
    solidBorder: palette.blue[300],
    solidText: palette.blue[400],
    dot: palette.blue[300],
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
          color: "white",
          cursor: readonly ? "default" : isReadonly ? "not-allowed" : "pointer",
        }
    : disabled
      ? {
          background: palette.neutral[100],
          borderColor: palette.neutral[200],
          color: palette.neutral[200],
          cursor: "not-allowed",
        }
      : readonly
        ? {
            background: palette.marine[50],
            borderColor: palette.neutral[200],
            color: palette.marine[400],
            cursor: "default",
          }
        : {
            background: "white",
            borderColor: palette.neutral[200],
            color: palette.neutral[500],
            cursor: "pointer",
          };

  const dotStyle: React.CSSProperties = isOn
    ? implied
      ? { background: COLOR.dot, borderColor: COLOR.dot }
      : { background: "white", borderColor: "white" }
    : { background: "transparent", borderColor: "currentColor", opacity: 0.4 };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      onClick={() => !isReadonly && onChange(!checked)}
      style={buttonStyle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-body font-medium transition-all duration-200 select-none"
    >
      <span
        style={dotStyle}
        className="w-3.5 h-3.5 rounded-full border transition-all duration-200 flex-shrink-0"
      />
      {label}
      {implied && (
        <span className="text-caption font-normal opacity-60 ml-0.5">
          (auto)
        </span>
      )}
    </button>
  );
}

export default PermissionToggle;
