import { ComponentProps } from "react";
import { HiCheck } from "react-icons/hi";
import { TypeMarker } from "../../../types/map/marker";
import { MarkerPin } from "../../molecules/mapBox";

interface CheckMapFilterProps extends ComponentProps<"div"> {
  label: string;
  type: TypeMarker;
  checked: boolean;
}

export function CheckMapFilter({
  label,
  type,
  checked,
  ...props
}: CheckMapFilterProps) {
  return (
    <div
      className="flex gap-3 items-center cursor-pointer py-1"
      {...props}
    >
      <div className="bg-white bg-opacity-70 h-5 w-5 relative rounded-sm shrink-0">
        {checked && (
          <HiCheck className="absolute h-8 w-8 -left-1 -bottom-1 fill-green3" />
        )}
      </div>
      <label className="text-white font-black flex-1 cursor-pointer">
        {label}
      </label>
      <MarkerPin type={type} size={28} />
    </div>
  );
}
