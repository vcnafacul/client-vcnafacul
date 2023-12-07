/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentProps } from "react";
import { VariantProps, tv } from "tailwind-variants"
import { FormFieldOption } from "../../molecules/formField";
import { FieldValues, UseFormRegister } from 'react-hook-form';

const input = tv({
    base: 'bg-white appearance-none box-border w-full rounded-lg border text-grey' + 
    ' text-xs pl-5 pr-2 pt-5 pb-2 outline-orange bg-no-repeat md:text-base md:pt-7 md:pb-3 md:mx-6',
    variants: {
        erro: {
            true: 'border-red-500',
            false: 'border-gray-300'
        },
        size: {
            base: 'h-16',
            small: 'h-11'
        }
    },
    defaultVariants: {
        erro: false,
        size: 'base'
    }
})


export type InputProps = VariantProps<typeof input> & ComponentProps<'input'> & {
    className?: string;
    options?: FormFieldOption[];
    defaultValue?: any;
    register: UseFormRegister<FieldValues>;
}

function Input({ erro, size, className, type, options, defaultValue, register, ...props } : InputProps){

    if(type === 'option') {
        return (
            <select {...register(props.name!)} disabled={props.disabled} className={input({ erro, size, className })} defaultValue={defaultValue}>
                {options!.map((opt, index) => (
                    <option key={index} value={opt.value}>{opt.label}</option>
                    ))}
            </select>
        )
    }
    else if(type === 'textarea') {
        return <textarea {...register(props.name!)} className={`${input({ erro, size, className })} min-h-[250px] overflow-y-auto scrollbar-hide`} defaultValue={defaultValue} />
    } 
    return <input {...register(props.name!)} defaultValue={defaultValue} autoComplete="on" className={input({ erro, size, className })} type={type} {...props} />
}

export default Input