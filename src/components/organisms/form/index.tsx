import { ComponentProps } from "react"
import { CampoDoFormulario } from "@/components/formulario/campo-do-formulario"
import type { FormFieldInput } from "@/components/formulario/tipos"
import { FormLegend } from "@/components/ui/field"
import { Control, FieldValues } from "react-hook-form";

export type FormProps<T extends FieldValues = FieldValues> = ComponentProps<'div'> & {
    formFields: FormFieldInput[];
    control: Control<T>;
}

function Form<T extends FieldValues>({ formFields, control, ...props } : FormProps<T>){
   return (
        <div {...props}>
            {formFields.some((f) => f.required) && <FormLegend />}
            {formFields.map(fData =>
                    <CampoDoFormulario
                    key={fData.id}
                    {...fData}
                    control={control}
                    />
                )}
        </div>
   )
}

export default Form
