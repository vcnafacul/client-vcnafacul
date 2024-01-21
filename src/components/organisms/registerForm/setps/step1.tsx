/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { StepProps } from ".."
import FormField from "../../../molecules/formField";
import { lowercaseLetterRegex, specialCaracteresRegex, uppercaseLetterRegex } from "../../../../pages/register/data";
import Button from "../../../molecules/button";
import SpanValidate from "../../../atoms/spanValidate";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useForm } from "react-hook-form";
import { validNewEmail } from "../../../../services/auth/validNewEmail";
import { toast } from "react-toastify";
import { useEffect } from "react";

interface Step1Props extends StepProps {
    updateData: (data: any) => void;
}

function Step1({ formData, updateData, dataUser } : Step1Props){
    const schema = yup
        .object()
        .shape({
            email: yup.string().email().required('Por favor, preencha um email valido'),
            password: yup.string().required('Senha obrigatória')
            .min(8, 'Senha muito curta, deve ter no mínimo 8 caracteres')
            .matches(lowercaseLetterRegex, 'A senha precisa ter pelo menos uma letra minuscula')
            .matches(uppercaseLetterRegex, 'A senha precisa ter pelo menos uma letra maiuscula')
            .matches(specialCaracteresRegex, 'A senha precisa ter pelo menos um caracter especial')
            ,
            password_confirmation: yup.string().required('Por favor, confirmação senha obrigatória')
            .oneOf([yup.ref('password')], 'Senhas devem coincidir')
        })
        .required()

    const {register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
        resolver: yupResolver(schema),
    });

    const continueRegister = (data: any) => {
        validNewEmail(data.email)
            .then(_ => {
                updateData(data)
            })
            .catch((error: Error) => {
                toast.info(error.message)
            })
    }

    const password = watch('password')

    useEffect(() => {
        if(dataUser.email){
            setValue('email', dataUser.email)
        }
    }, [])
    
    return (
        <form onSubmit={handleSubmit(continueRegister)} className="flex flex-col gap-4 w-full">
            <FormField register={register} id={formData[0].id} key={formData[0].id} label={formData[0].label} type={formData[0].type} visibility={formData[0].visibility} error={errors['email']} />
            <FormField register={register} id={formData[1].id} key={formData[1].id} label={formData[1].label} type={formData[1].type} visibility={formData[1].visibility} />
            <div className="flex gap-4 w-full text-sm">
                <div className="font-thin text-xs"> Sua senha deve conter:</div>
                <div className="flex flex-col text-sm">
                    <SpanValidate valid={password !== undefined && uppercaseLetterRegex.test(password)}>Letra Maiúscula</SpanValidate>
                    <SpanValidate valid={password !== undefined && specialCaracteresRegex.test(password)}>Caractere Especial</SpanValidate>
                </div>
                <div className="flex flex-col text-sm">
                    <SpanValidate valid={password !== undefined && lowercaseLetterRegex.test(password)}>Letra Minúscula</SpanValidate>
                    <SpanValidate valid={password !== undefined && password.trim().length >= 8}>Pelo menos 8 Caracteres</SpanValidate>
                </div>
            </div>
            <FormField register={register} id={formData[2].id} key={formData[2].id} label={formData[2].label} type={formData[2].type} visibility={formData[2].visibility} error={errors['password_confirmation']} />
            <Button type="submit">Continuar</Button>
        </form>
    )
}

export default Step1