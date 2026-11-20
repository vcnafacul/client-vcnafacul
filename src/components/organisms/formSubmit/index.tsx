/* eslint-disable @typescript-eslint/no-explicit-any */
import { CampoDoFormulario } from "@/components/formulario/campo-do-formulario";
import type { FormFieldInput } from "@/components/formulario/tipos";
import { Button, type ButtonProps } from "@/components/ui/button";
import { FormLegend } from "@/components/ui/field";
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
        {formFields.some((f) => f.required) && <FormLegend />}
        {formFields.map((f) =>
            <CampoDoFormulario register={register} id={f.id} key={f.id} label={f.label} type={f.type} visibility={f.visibility} required={f.required} />)}
        <Button disabled={disabled} className="w-full" variant={variant} size={size} type="submit" >{labelSubmit}</Button>
    </form>
   )
}

export default FormSubmit
