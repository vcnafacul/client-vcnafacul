/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form"
import Button from "../../../components/molecules/button"
import { FormFieldInput, FormFieldOption } from "../../../components/molecules/formField"
import Form from "../../../components/organisms/form"
import ModalTemplate, { ModalProps } from "../../../components/templates/modalTemplate"
import { CreateFrenteDtoOutput } from "../../../dtos/content/frenteDto"
import { toast } from "react-toastify"
import { useAuthStore } from "../../../store/auth"
import { createFrente } from "../../../services/content/createFrente"
import PropValue from "../../../components/molecules/PropValue"
import { FormFieldOptionDelete } from "./settingsContent"

interface NewFrenteProps extends ModalProps {
    materia: FormFieldOption
    addFrente: (frente: FormFieldOptionDelete) => void;
}

function NewFrente({ handleClose, materia, addFrente} : NewFrenteProps){
    const {register, handleSubmit } = useForm();

    const { data: { token }} = useAuthStore()
    
    const listFields : FormFieldInput[] = [
        {id: 'name', type: 'text', label: 'Nome', className: 'col-span-2', validation: {
            required: `Você precisa definir um Título`,
            minLength: { value: 1}
        }},
    ]

    const create = (data: any) => {
        const body : CreateFrenteDtoOutput = {
            name: data.name,
            materia: parseInt(materia.value)
        }
        const id = toast.loading("Criando Frente ... ")
        createFrente(body, token)
            .then(res => {
                toast.update(id, { render: `Frente ${body.name} Criada`, type: 'success', isLoading: false, autoClose: 3000,})
                addFrente({ label: body.name, value: res.id, canDelete: true })
                handleClose()
            })
            .catch((error: Error) => {
                toast.update(id, {render: error.message, type: "error", isLoading: false, autoClose: 3000, });
            })
    }
    
    return (
        <ModalTemplate>
            <div className="bg-white p-4 rounded-md w-96">
                <form onSubmit={handleSubmit(create)}>
                    <PropValue prop="Materia" value={materia.label} />
                    <Form className="flex flex-col gap-4 my-4" formFields={listFields} register={register}/>
                    <div className="flex gap-4 flex-wrap sm:flex-nowrap">
                        <Button type="submit">Criar</Button>
                        <Button type="button" onClick={handleClose}>Fechar</Button>
                    </div>
                </form>
            </div>
        </ModalTemplate>
    )
}

export default NewFrente