import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    value?: Date;
    onChange?: (date: Date | undefined) => void;
    placeholder?: string;
    className?: string;
    captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years";
    fromYear?: number;
    toYear?: number;
}

export function DatePicker({
    value,
    onChange,
    placeholder = "Pick a date",
    className,
    captionLayout = "dropdown",
    fromYear = 1900,
    toYear = new Date().getFullYear()
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false)

    const handleSelect = (date: Date | undefined) => {
        if (date) {
            // Create a new date at noon in local timezone to avoid timezone issues
            const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
            onChange?.(localDate);
        } else {
            onChange?.(date);
        }
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    data-empty={!value}
                    className={`data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal ${className || ''}`}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(value, "MM/dd/yyyy") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={handleSelect}
                    captionLayout={captionLayout}
                    fromYear={fromYear}
                    toYear={toYear}
                    defaultMonth={value}
                />
            </PopoverContent>
        </Popover>
    )
}