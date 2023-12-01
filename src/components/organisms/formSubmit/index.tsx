import { ComponentProps } from "react"
import FormField, { FormFieldInput } from "../../molecules/formField"
import Button from "../../molecules/button";

export type FormSubmitProps = ComponentProps<'form'> & {
    formFields: FormFieldInput[]
    labelSubmit: string;
    styleButton?:  "primary" | "secondary" | "tertiary";
    sizeButton?: "base" | "small";
    className?: string;
    handleOnChange: (event: React.InputHTMLAttributes<HTMLInputElement>) => void;
}

function FormSubmit({ formFields, labelSubmit, styleButton = "primary", sizeButton = "base", className, handleOnChange, ...props } : FormSubmitProps){
   return (
    <form className={`${className} `} {...props}>
        {formFields.map((f, i) => 
            <FormField id={f.id} key={i} label={f.label} type={f.type} visibility={f.visibility} handleOnChange={handleOnChange} />)}
        <Button className="w-full" typeStyle={styleButton} size={sizeButton} type="submit" >{labelSubmit}</Button>
    </form>
   )
}

export default FormSubmit