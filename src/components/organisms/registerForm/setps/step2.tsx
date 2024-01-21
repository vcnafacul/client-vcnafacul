import { StepProps } from ".."
import Button from "../../../molecules/button";
import { registerUser } from "../../../../services/auth/registerUser";
import { UserRegister } from "../../../../types/user/userRegister";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useForm } from "react-hook-form";
import { useAuthStore } from "../../../../store/auth";
import { toast } from "react-toastify";
import Form from "../../form";

interface Step2Props extends StepProps {
    dataUser: UserRegister,
    next: () => void;
    back: () => void;
}

function Step2({ formData, dataUser, next, back } : Step2Props){
    const { doAuth } = useAuthStore()

    const schema = yup
        .object()
        .shape({
            firstName: yup.string().required('Por favor, informe seu nome'),
            lastName: yup.string().required('Por favor, informe seu sobrenome'),
            phone: yup.string().required('campo obrigatório'),
            birthday: yup.date().nullable().transform((curr, orig) => orig === '' ? null : curr)
                .required('campo obrigatório'),
            city: yup.string().required('campo obrigatório'),
            lgpd: yup.boolean()
            .oneOf([true], 'Você deve aceitar os termos e políticas')
            .required('Por favor, confirmação necessária')
        })
        .required()
    
    const {register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });
  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerSubmit = (data: any) => {
        registerUser({...dataUser, ...data})
            .then(res => {
                doAuth(res)
                next()
                toast.success('Cadastro realizado com sucesso')
            })
            .catch((error: Error) => {
                toast.error(error.message)
            })
    }
    
    return (
        <form onSubmit={handleSubmit(registerSubmit)} className="w-full">
            <Form className="flex flex-col gap-4" register={register} formFields={formData} errors={errors} />
            <div className="flex w-full gap-2 justify-center my-2">
                <input type="checkbox" {...register('lgpd')} />
                <span>Eu li e aceito os{" "} 
                    <a className="font-black text-grey" onClick={(e) => e.stopPropagation()} href="/Termos%20de%20Uso.pdf" target="_blank">
                            termos de uso
                    </a>
                    {" "}e{" "}   
                    <a
                        className="font-black text-grey"
                        onClick={(e) => e.stopPropagation()}
                        href="/Pol%C3%ADtica%20de%20Privacidade.pdf"
                        target="_blank" >
                            políticas de privacidade
                    </a></span>
            </div>
            <div className="text-red w-full text-center">{errors['lgpd']?.message}</div>
            <div className="flex gap-4">
                <Button type="button" onClick={back}>Voltar</Button>
                <Button type="submit">Cadastrar</Button>
            </div>
        </form>
    )
}

export default Step2