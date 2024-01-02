/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from 'react-hook-form';
import { ReactComponent as LogoIcon } from '../../assets/images/home/logo.svg'
import { Auth, useAuthStore } from '../../store/auth'
import { FormFieldInput } from '../../components/molecules/formField';
import Form from '../../components/organisms/form';
import { optionsGender } from '../register/data';
import Button from '../../components/molecules/button';
import Text from '../../components/atoms/text';
import ImageProfile from '../../components/molecules/imageProfile';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { changeImageProfileCollaborator } from '../../services/auth/changeImageProfileCollaborator';
import ModalConfirmCancel from '../../components/organisms/modalConfirmCancel';
import { removeImageProfileCollaborator } from '../../services/auth/removeImageProfileCollaborator';
import { me } from '../../services/auth/me';

function Account(){
    const {register, handleSubmit } = useForm();
    const { data: {token}, updateAccount } = useAuthStore()
    const [tryDelete, setTryDelete] = useState<boolean>(false);

    const [userAccount, setUserAccount] = useState<Auth>()

    const VITE_FTP_PROFILE = import.meta.env.VITE_FTP_PROFILE;
    const [imagePreview, setImagePreview] = useState<any>(null);

    const listInfo : FormFieldInput[]= [
        {id: "firstName", type: "text", label: "Nome:", value: userAccount?.firstName},
        {id: "lastName", type: "text", label: "Sobrenome:", value: userAccount?.lastName},
        {id: "gender", type: 'option', options: optionsGender, label: "Gênero:", value: userAccount?.gender},
        {id: "birthday", type: "date", label: "Data de Nascimento:", value: userAccount?.birthday ? userAccount.birthday.split('T')[0] : ''},
        {id: "phone", type: "text", label: "Telefone:", value: userAccount?.phone}, 
        {id: "state", type: "text", label: "Estado:", value: userAccount?.state},
        {id: "city", type: "text", label: "Cidade:", value: userAccount?.city},
        {id: "about", type: "textarea", label: "Sobre mim:", value: userAccount?.about, className: `col-span-1 ${userAccount?.collaborator ? 'sm:col-span-2 md:col-span-3 lg:col-span-4': 'sm:col-span-2 md:col-span-4'}`},
    ]

    const previewImage = (file: any) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
      };

    const handleImageChange = (e: any) => {
        e.preventDefault();
        const file = e.target.files[0];
        if(file.size > 1024*1024) {
            toast.warn('O arquivo pode ter no máximo 1mb', { theme: 'dark'})
        }
        else{
            previewImage(file);
            uploadingImagem(file);
        }
      };

    const uploadingImagem = (file: any) => {
        const id = toast.loading("Upload de Imagem de Perfil Colaborador ... ")
        const formData = new FormData()
        formData.append('file', file!)
        changeImageProfileCollaborator(formData, token)
            .then(fileName => {
                toast.update(id, { render: `Upload feito com sucesso`, type: 'success', isLoading: false, autoClose: 3000,})
                updateAccount({...userAccount!, collaboratorPhoto: fileName})
            })
            .catch((error: Error) => {
                toast.update(id, {render: error.message, type: "error", isLoading: false, autoClose: 3000, });
            })
    }

    const deleteImage = () => {
        if(userAccount?.collaboratorPhoto) {
            removeImageProfileCollaborator(token)
                .then(res => {
                    if(res) {
                        updateAccount({...userAccount!, collaboratorPhoto: null })
                    }
                    else {
                        toast.error('Não foi possível remover sua imagem')
                    }
                })
                .catch((error: Error) => {
                    toast.error(error.message)
                })
        }
        else {
            setImagePreview(null)
        }
        setTryDelete(false)
    }

    const ModalDelete = () => {
        if(!tryDelete) return null
        return (
            <ModalConfirmCancel 
            handleCancel={() => setTryDelete(false)}
            handleConfirm={deleteImage}
            text='Tem certeza que deseja deletar sua imagem?'
             />
        )
    }

    useEffect(() => {
        console.log('foi chamado')
        me(token)
            .then(res => {
                setUserAccount(res)
                if(res?.collaboratorPhoto) {
                    setImagePreview(`${VITE_FTP_PROFILE}${res.collaboratorPhoto}`)
                }
            })
            .catch((error: Error) => {
                toast.error(error.message)
            })
    }, [token])

    return (
       <>
        <div className='pb-20 bg-zinc-100 flex flex-col'>
            <div className='bg-custom-gradient py-1 px-4 flex items-center rounded-bl-3xl'>
                <LogoIcon className='bg-white w-28 h-28 z-0 animate-rotate rounded-full p-1 border border-green2' />
                <div className='flex flex-col items-end'>
                    <span className='text-white text-4xl font-black ml-4'>{userAccount?.firstName}</span>
                    <span className='text-white text-xl'>{userAccount?.lastName}</span>
                </div>
            </div>
            <Text className='self-start mx-10 pt-4' size='secondary'>Meus Dados</Text>
            <div className=' ml-4 sm:mr-4 grid grid-cols-1 md:grid-cols-4 pr-6 sm:pr-0'>
                {userAccount?.collaborator ? 
                <div className='m-4 flex flex-col items-center rounded-full md:col-span-1 md:col-start-4'>
                    <Text size='tertiary'>Imagem Profile Colaborador</Text>
                    <ImageProfile deleteImage={() => { setTryDelete(true)}} onChange={handleImageChange} src={imagePreview} />
                        {/* {!change ? <></> : <div className='w-40'><Button typeStyle='secondary' size='small' className='mt-2' hover type='button' onClick={uploadingImagem}>Salvar</Button></div>} */}
                </div> 
                : <></>}
                {userAccount ? <form onSubmit={handleSubmit(() => {})} className={`flex flex-col pb-10 w-full gap-4 ${userAccount?.collaborator ? 'md:col-span-3' : 'md:col-span-4'} md:col-start-1 md:row-start-1`}>
                    <Form className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${userAccount?.collaborator ? '' : ' md:grid-cols-3'} gap-4`} formFields={listInfo} register={register} />
                    <div className='w-60 self-start'><Button hover type='submit'>Atualizar</Button></div>
                </form> : <></>}
            </div>
        </div>
        <ModalDelete />
        </>
    )
}

export default Account