import { StepProps } from ".."
import FormField from "../../../molecules/formField";
import { useEffect, useRef, useState } from "react";
import { lengthPassword, lowercaseLetter, specialCaracteres, uppercaseLetter } from "../../../../pages/register/data";
import Button from "../../../molecules/button";
import SpanValidate from "../../../atoms/spanValidate";
import { FieldValues, UseFormSetFocus } from "react-hook-form";


interface Step1Props extends StepProps {
    next: () => void;
    setFocus: UseFormSetFocus<FieldValues>;
}

function Step1({formData, register, watch, next, setFocus} : Step1Props){
    const [validated, setValidated] = useState<boolean>()
    const password = watch(formData[1].id)
    const inputRef  = useRef(null)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const validatePassword = () => {
        if(uppercaseLetter(password) && lowercaseLetter(password) && specialCaracteres(password) && lengthPassword(password)){
            setValidated(true)
        }
        else setValidated(false)
    }

    useEffect(() => {
        const subscription = watch(() => {})
        setFocus(formData[1].id)
        validatePassword()
        return () => subscription.unsubscribe()
    }, [validatePassword, watch])
    
    return (
        <>
            <FormField register={register} id={formData[0].id} key={formData[0].id} label={formData[0].label} type={formData[0].type} visibility={formData[0].visibility} />
            <FormField ref={inputRef} register={register} id={formData[1].id} key={formData[1].id} label={formData[1].label} type={formData[1].type} visibility={formData[1].visibility} />
            <div className="flex gap-4 w-full text-sm">
                <div className="font-thin text-xs"> Sua senha deve conter:</div>
                <div className="flex flex-col text-sm">
                    <SpanValidate valid={uppercaseLetter(password)}>Letra Maiúscula</SpanValidate>
                    <SpanValidate valid={specialCaracteres(password)}>Caractere Especial</SpanValidate>
                </div>
                <div className="flex flex-col text-sm">
                    <SpanValidate valid={lowercaseLetter(password)}>Letra Minúscula</SpanValidate>
                    <SpanValidate valid={lengthPassword(password)}>Pelo menos 8 Caracteres</SpanValidate>
                </div>
            </div>
            <FormField register={register} id={formData[2].id} key={formData[2].id} label={formData[2].label} type={formData[2].type} visibility={formData[2].visibility} />
            <Button type="button" onClick={validated ? next : () => {}}>Continuar</Button>
        </>
    )
}

export default Step1