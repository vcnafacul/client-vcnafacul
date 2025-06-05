import { Input, InputProps } from "@/components/ui/input";
import { useState } from "react";
import { AiFillEyeInvisible } from "react-icons/ai";
import { IoMdEye } from "react-icons/io";

export function InputText({ ...props }: InputProps) {
  const [visible, setVisible] = useState<boolean>(false);
  function backgroundImageToggleVisibility(visible: boolean) {
    return visible ? (
      <AiFillEyeInvisible
        onClick={() => setVisible(!visible)}
        className="absolute p-0 bg-transparent w-6 h-6 right-3 top-4 cursor-pointer fill-grey"
      />
    ) : (
      <IoMdEye
        onClick={() => setVisible(!visible)}
        className="absolute p-0 bg-transparent w-6 h-6 right-3 top-4 cursor-pointer fill-grey"
      />
    );
  }

  return (
    <div>
      <Input
        {...props}
        className={`h-16 pt-4 focus-visible:ring-orange ${props.className}`}
        id={props.id}
        autoComplete="on"
        type={
          props.type === "password"
            ? visible
              ? "text"
              : "password"
            : props.type
        }
      />
      {props.type !== "password" ? <></> : backgroundImageToggleVisibility(visible)}
    </div>
  );
}
