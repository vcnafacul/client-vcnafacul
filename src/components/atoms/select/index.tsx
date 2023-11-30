import { ComponentProps } from "react"

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
        <select 
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
    )
}

export default Select