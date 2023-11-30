import { ComponentProps } from "react"
import { TiArrowSortedDown } from "react-icons/ti";
import './styles.css'

interface Option {
    id: number,
    name: string;
}

type SelectProps = ComponentProps<'select'> & {
    options: Option[]
    defaultValue: number;
    disabled?: boolean;
    setState: (value: number) => void;
}

function Select({ options, disabled, defaultValue, setState } : SelectProps){
    return (
        <div className="relative group">
            <select 
            className="remove-arrow w-full h-full text-lg font-black text-marine pl-4 pr-10 py-1 rounded-xl shadow-md z-50"
            disabled={disabled ?? false}
            defaultValue={defaultValue} 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e: any) => {
                setState(Number(e.target.value));
            }}>
            {options.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
            </select>
            <TiArrowSortedDown className="absolute right-1 top-0 w-10 h-10 z-0 fill-marine group-hover:rotate-180 transition-all duration-200" />
        </div>

    )
}

export default Select