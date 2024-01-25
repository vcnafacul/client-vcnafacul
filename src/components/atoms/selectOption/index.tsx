import { ComponentProps } from "react"
import { TiArrowSortedDown } from "react-icons/ti";
import './styles.css'

export interface OptionProps {
    id: number | string,
    name: string;
}

type SelectProps = ComponentProps<'select'> & {
    options: OptionProps[]
    defaultValue?: OptionProps;
    disabled?: boolean;
    setState: (value: OptionProps) => void;
}

export function SelectOption({ options, disabled, defaultValue, setState } : SelectProps){
    return (
        <>
        <div className="relative group">
            <TiArrowSortedDown className="absolute select-none right-1 top-0 w-10 h-10 fill-marine" />
            <select 
            className="remove-arrow w-full h-full text-lg font-black text-marine pl-4 pr-10 py-1 rounded-xl shadow-md z-50"
            disabled={disabled ?? false}
            defaultValue={defaultValue?.id} 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setState(options.find(item => item.id === e.target.value)!);
            }}>
            {options.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
            </select>
        </div>
        </>
    )
}