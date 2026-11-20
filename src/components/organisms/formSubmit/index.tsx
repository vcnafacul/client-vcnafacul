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
    const { control, handleSubmit } = useForm();
    return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={`${className}`} {...props}>
        {formFields.some((f) => f.required) && <FormLegend />}
        {formFields.map((f) =>
            <CampoDoFormulario key={f.id} {...f} control={control} />)}
        <Button disabled={disabled} className="w-full" variant={variant} size={size} type="submit" >{labelSubmit}</Button>
    </form>
   )
}

export default FormSubmit
