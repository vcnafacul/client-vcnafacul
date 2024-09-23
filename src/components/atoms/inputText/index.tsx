import { Input, InputProps } from "@/components/ui/input";

export function InputText({ ...props }: InputProps) {
  return (
    <Input
      {...props}
      className={`h-16 pt-4 focus-visible:ring-orange ${props.className}`}
      id={props.id}
      autoComplete="on"
    />
  );
}
