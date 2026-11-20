/* eslint-disable @typescript-eslint/no-explicit-any */
import FormField, { FormFieldInput } from "../../molecules/formField"
import { Button, type ButtonProps } from "@/components/ui/button";
import { useForm } from 'react-hook-form';

export type FormSubmitProps = {
    formFields: FormFieldInput[]
    labelSubmit: string;
    variant?: ButtonProps["variant"];
    size?: "sm" | "md" | "lg";
    className?: string;
    disabled?: boolean;
    onSubmit: (data: any) => void;
}

function FormSubmit({ formFields, labelSubmit, variant = "primary", size = "lg", className, onSubmit, disabled, ...props } : FormSubmitProps){
    const { register, handleSubmit } = useForm();
    return (
    <form onSubmit={handleSubmit(onSubmit)} className={`${className}`} {...props}>
        {formFields.map((f) => 
            <FormField register={register} id={f.id} key={f.id} label={f.label} type={f.type} visibility={f.visibility} />)}
        <Button disabled={disabled} className="w-full" variant={variant} size={size} type="submit" >{labelSubmit}</Button>
    </form>
   )
}

export default FormSubmit