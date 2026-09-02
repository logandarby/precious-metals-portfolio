import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DatePickerProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
};

export function DatePicker({ id, value, onChange, invalid }: DatePickerProps) {
  const selected = value ? parseISO(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger
        id={id}
        render={
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start font-normal"
            aria-invalid={invalid}
          />
        }
      >
        <CalendarIcon />
        {selected ? format(selected, "MMM d, yyyy") : "Pick a date"}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) {
              onChange(format(date, "yyyy-MM-dd"));
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
