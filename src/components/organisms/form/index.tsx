import { ComponentProps } from "react"
import FormField, { FormFieldInput } from "../../molecules/formField"

export type FormProps = ComponentProps<'div'> & {
    formFields: FormFieldInput[]
    handleOnChange: (event: React.InputHTMLAttributes<HTMLInputElement>) => void;
}

function Form({ formFields, handleOnChange, ...props } : FormProps){
   return (
        <div {...props}>
            {formFields.map((f, i) => 
                <FormField 
                    id={f.id} 
                    key={i} 
                    label={f.label} 
                    value={f.value} 
                    type={f.type} 
                    visibility={f.visibility} 
                    disabled={f.disabled}
                    options={f.options}
                    handleOnChange={handleOnChange} />
                )}
        </div>
   )
}

export default Form