export interface RadioProps extends RadioButtonProps{
    value: number;
}

export interface RadioButtonProps{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange: (event: any) => void;
    checked: boolean;
    children?: React.ReactNode;
}

function RadioButton({ onChange, checked, children } : RadioButtonProps) {
   return (
    <label className="flex items-center text-grey text-sm font-medium my-2 gap-2">
            <input type="radio" onChange={onChange} checked={checked} />
            <span>{children}</span>
    </label>
   )
}

export default RadioButton