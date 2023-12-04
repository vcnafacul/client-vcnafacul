import Text from "../../atoms/text"
import { useState } from "react";
import FormField, { FormFieldInput } from "../../molecules/formField";
import { createObjectFromFormFieldInput } from "../../../utils/createObject";
import Login from "../../../services/auth/login";
import { useAuthStore } from "../../../store/auth";
import { useNavigate } from "react-router-dom";
import { DASH } from "../../../routes/path";
import Button from "../../molecules/button";

export interface RegisterFormProps {
    title: string;
    subtitle: string;
    labelSubmit: string;
    formData: FormFieldInput[]
}

function RegisterForm({ title, subtitle, labelSubmit, formData } : RegisterFormProps){

    const [data, setData] = useState(createObjectFromFormFieldInput(formData)) 
    const { doAuth } = useAuthStore()
    const navigate = useNavigate();
    

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleInputChange = (event: any) => {
        const { name, value } = event.target;
        setData({ ...data, [name]: value });
    };

    const login = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        Login(data.email as string, data.password as string)
            .then(res => {
                doAuth(res)
                navigate(DASH);
            })
            .catch((e: Error) => {
                console.log(e)
                //setError({message: e.message})
            })
            .finally(() => {
                //setLoading(false)
            })
    }

    return (
        <div className="w-full h-[calc(100vh-88px)] flex justify-start items-center flex-col mx-auto">
             <div className="flex-grow mt-20 max-w-[500px] flex flex-col items-center ">
                <Text size="secondary">{title}</Text>
                <Text size="quaternary" className="text-orange my-5">{subtitle}</Text>
                <form className='w-96 my-4 bg-red'>
                    <FormField id={formData[0].id} key={formData[0].id} label={formData[0].label} type={formData[0].type} visibility={formData[0].visibility} handleOnChange={handleInputChange} />
                    <FormField id={formData[1].id} key={formData[1].id} label={formData[1].label} type={formData[1].type} visibility={formData[1].visibility} handleOnChange={handleInputChange} />
                    <FormField id={formData[2].id} key={formData[2].id} label={formData[2].label} type={formData[2].type} visibility={formData[2].visibility} handleOnChange={handleInputChange} />
                    <Button type="submit" >{labelSubmit}</Button>
                </form>
            </div>
        </div>
    )
}

export default RegisterForm