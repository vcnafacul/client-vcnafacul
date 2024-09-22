import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectProps } from "@radix-ui/react-select";

export interface InputSelectProps extends SelectProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: { label: any; value: any }[];
  className?: string;
}

export function InputSelect({ options, ...props }: InputSelectProps) {
  return (
    <Select {...props}>
      <SelectTrigger className={`h-16 pt-4 items-end ${props.className}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
