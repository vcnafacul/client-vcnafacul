/* eslint-disable @typescript-eslint/no-explicit-any */
import FormField, { FormFieldInput } from "../../molecules/formField"
import Button from "../../molecules/button";
import { useForm } from 'react-hook-form';

export type FormSubmitProps = {
    formFields: FormFieldInput[]
    labelSubmit: string;
    styleButton?:  "primary" | "secondary" | "tertiary";
    sizeButton?: "base" | "small";
    className?: string;
    onSubmit: (data: any) => void;
}

function FormSubmit({ formFields, labelSubmit, styleButton = "primary", sizeButton = "base", className, onSubmit, ...props } : FormSubmitProps){
    const { register, handleSubmit } = useForm();
    return (
    <form onSubmit={handleSubmit(onSubmit)} className={`${className} `} {...props}>
        {formFields.map((f) => 
            <FormField register={register} id={f.id} key={f.id} label={f.label} type={f.type} visibility={f.visibility} />)}
        <Button className="w-full" typeStyle={styleButton} size={sizeButton} type="submit" >{labelSubmit}</Button>
    </form>
   )
}

export default FormSubmit