import { Input, InputProps } from "@/components/ui/input";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function InputText({ ...props }: InputProps) {
  const [visible, setVisible] = useState<boolean>(false);
  function backgroundImageToggleVisibility(visible: boolean) {
    return visible ? (
      <EyeOff
        onClick={() => setVisible(!visible)}
        className="absolute p-0 bg-transparent w-6 h-6 right-3 top-4 cursor-pointer text-muted-foreground"
      />
    ) : (
      <Eye
        onClick={() => setVisible(!visible)}
        className="absolute p-0 bg-transparent w-6 h-6 right-3 top-4 cursor-pointer text-muted-foreground"
      />
    );
  }

  return (
    <div>
      <Input
        {...props}
        className={`h-16 pt-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${props.className}`}
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
