import { useForm } from 'react-hook-form';
import { ReactComponent as LogoIcon } from '../../assets/images/home/logo.svg'
import { useAuthStore } from '../../store/auth'
import { FormFieldInput } from '../../components/molecules/formField';
import Form from '../../components/organisms/form';
import { optionsGender } from '../register/data';
import { convertDateFormat } from '../../utils/convertDateFormat';
import Button from '../../components/molecules/button';
import Text from '../../components/atoms/text';


function Account(){
    const {register, handleSubmit } = useForm();
    const { data } = useAuthStore()

    const listInfo : FormFieldInput[]= [
        {id: "firstName", type: "text", label: "Nome:", value: data.user.firstName},
        {id: "lastName", type: "text", label: "Sobrenome:", value: data.user.lastName},
        {id: "gender", type: 'option', options: optionsGender, label: "Gênero:", value: data.user.gender},
        {id: "birthday", type: "date", label: "Data de Nascimento:", value: convertDateFormat(data.user.birthday)},
        {id: "phone", type: "text", label: "Telefone:", value: data.user.phone}, 
        {id: "state", type: "text", label: "Estado:", value: data.user.state},
        {id: "city", type: "text", label: "Cidade:", value: data.user.city},
    ]

    return (
        <div>
            <div className='bg-custom-gradient py-1 px-4 flex items-center rounded-bl-3xl'>
                <LogoIcon className='bg-white w-28 h-28 z-0 animate-rotate rounded-full p-1 border border-green2' />
                <div className='flex flex-col items-end'>
                    <span className='text-white text-4xl font-black ml-4'>{data.user.firstName}</span>
                    <span className='text-white text-xl'>{data.user.lastName}</span>
                </div>
            </div>
            <div className='w-full mx-10 flex flex-col'>
                <Text className='self-start m-0 pt-4' size='secondary'>Meus Dados</Text>
                <form onSubmit={handleSubmit(() => {})} className='flex flex-col py-10 w-full gap-4'>
                    <Form className='w-11/12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' formFields={listInfo} register={register} />
                    <div className='w-60 self-end mx-20'><Button hover type='submit'>Atualizar</Button></div>
                </form>
            </div>
        </div>
    )
}

export default Account