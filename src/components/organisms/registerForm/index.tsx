import Text from "../../atoms/text"
import { FormFieldInput } from "../../molecules/formField";
import { useAuthStore } from "../../../store/auth";
import { toast } from "react-toastify";
import Step1 from "./setps/step1";
import { FieldValues, UseFormRegister, UseFormWatch, useForm } from 'react-hook-form';
import { useState } from "react";
import Step2 from "./setps/step2";
import { registerUser } from "../../../services/auth/registerUser";
import Sucess from "./setps/sucess";


export interface StepProps {
    formData: FormFieldInput[];
    register: UseFormRegister<FieldValues>;
    watch: UseFormWatch<FieldValues>;
    
}
export interface RegisterFormProps {
    title: string;
    titleSucess: string;
    labelSubmit: string;
    formData: {
        step1: FormFieldInput[],
        step2: FormFieldInput[]
    }
}

function RegisterForm({ title, titleSucess, labelSubmit, formData } : RegisterFormProps){
    const [step, setStep] = useState<number>(1)
    const { register, handleSubmit, watch, setFocus  } = useForm({
        mode: 'all'
    });
    const { doAuth } = useAuthStore()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerSubmit = (data: any) => {
        registerUser(data)
            .then(res => {
                doAuth(res)
                nextStep()
                toast.success('Cadastro realizado com sucesso')
            })
            .catch((error: Error) => {
                toast.error(error.message)
            })
    }

    const nextStep = () => {
        if(step < 3){
            setStep(step + 1)
        }
    }

    const StepNow = () => {
        switch (step) {
            case 1:
                return <Step1 register={register} formData={formData.step1} watch={watch} next={nextStep} setFocus={setFocus} />
            case 2:
                return <Step2 register={register} formData={formData.step2} labelSubmit={labelSubmit} watch={watch}  />
            default:
                return <Sucess  />
        }
    }

    return (
        <div className="w-full h-[calc(100vh-88px)] flex justify-start items-center flex-col mx-auto">
             <div className="mt-10 max-w-[500px] flex flex-col items-center w-full gap-y-4">
                {step < 3 ? <Text size="secondary">{title}</Text> : <Text>{titleSucess}</Text>}
                <form className="flex flex-col gap-y-4 w-full" onSubmit={handleSubmit(registerSubmit)}>
                    <StepNow />
                </form>
            </div>
        </div>
    )
}

export default RegisterForm