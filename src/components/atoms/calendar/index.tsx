"use client";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ptBR } from "date-fns/locale";

interface CalendarFormProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function CalendarForm({ date, setDate }: CalendarFormProps) {
  return (
    <div className="relative">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full h-16 pl-3 pt-4 text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            {date ? (
              format(date, "PPP", { locale: ptBR })
            ) : (
              <span>Pick a date</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(date) =>
              date > new Date() || date < new Date("1900-01-01")
            }
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
      <label className="absolute left-3 top-1 text-xs text-grey">Data de Nascimento</label>
    </div>
  );
}
