import { HiCheck } from "react-icons/hi";
import { ReactComponent as PointIcon } from "../../../assets/images/home/univ_public.svg";
import { ComponentProps } from "react";

interface CheckMapFilterProps extends ComponentProps<'div'> {
  label: string;
  color: string;
  checked: boolean;
}

export function CheckMapFilter({label, color, checked, ...props} : CheckMapFilterProps) {
  return (
    <div className="flex gap-4 items-center" {...props}>
      <div className="bg-white bg-opacity-70 h-4 w-4 relative">
        {checked ? <HiCheck className=" absolute h-7 w-7 -left-0.5 -bottom-1 fill-green3" /> : <></>}
      </div>
      <label className="text-white font-black">{label}</label>
      <PointIcon className={`${color} h-8`} />
    </div>
  );
}
