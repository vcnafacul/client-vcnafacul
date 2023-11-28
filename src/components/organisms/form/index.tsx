import { ComponentProps } from "react"
import FormField, { FormFieldProps } from "../../molecules/formField"
import Button from "../../molecules/button";

export type FormProps = ComponentProps<'form'> & {
    formFields: FormFieldProps[]
    labelSubmit: string;
    styleButton?:  "primary" | "secondary" | "tertiary";
    sizeButton?: "base" | "small";
    className?: string;
}

function Form({ formFields, labelSubmit, styleButton = "primary", sizeButton = "base", className, ...props } : FormProps){
   return (
    <form className={`${className} `} {...props}>
        {formFields.map(f => <FormField label={f.label} type={f.type} visibility={f.visibility} />)}
        <Button typeStyle={styleButton} size={sizeButton} type="submit" >{labelSubmit}</Button>
    </form>
   )
}

export default Form