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
    <div className="flex gap-4 items-center" {...props}>
      <div className="bg-white bg-opacity-70 h-4 w-4 relative">
        {checked && (
          <HiCheck className="absolute h-7 w-7 -left-0.5 -bottom-1 fill-green3" />
        )}
      </div>
      <label className="text-white font-black flex-1">{label}</label>
      <MarkerPin type={type} size={22} />
    </div>
  );
}
