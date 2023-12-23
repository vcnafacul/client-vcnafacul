/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form"
import Button from "../../../components/molecules/button"
import { FormFieldInput, FormFieldOption } from "../../../components/molecules/formField"
import Form from "../../../components/organisms/form"
import ModalTemplate, { ModalProps } from "../../../components/templates/modalTemplate"
import { toast } from "react-toastify"
import { useAuthStore } from "../../../store/auth"
import { CreateSubjectDtoOutput } from "../../../dtos/content/SubjectDto"
import { createSubject } from "../../../services/content/createSubject"
import PropValue from "../../../components/molecules/PropValue"
import { FormFieldOptionSubject } from "./settingsContent"

interface NewSubjectProps extends ModalProps {
    materia: FormFieldOption;
    frente: FormFieldOption;
    addSubject: (subject: FormFieldOptionSubject) => void;
}

function NewSubject({ handleClose, materia, frente, addSubject } : NewSubjectProps){
    const {register, handleSubmit } = useForm();

    const { data: { token }} = useAuthStore()

    const listFields : FormFieldInput[] = [
        {id: 'name', type: 'text', label: 'Nome', className: 'col-span-2', validation: {
            required: `Você precisa definir um Título`,
            minLength: { value: 1}
        }},
        {id: 'description', type: 'textarea', label: 'Descricao', className: 'col-span-2', validation: {
            required: `Você precisa definir um Título`,
            minLength: { value: 1}
        }},
    ]

    const create = (data: any) => {
        const body : CreateSubjectDtoOutput = {
            frente: frente.value,
            name: data.name,
            description: data.description
        }
        const id = toast.loading("Criando Tema ... ")
        createSubject(body, token)
            .then(res => {
                toast.update(id, { render: `Tema Criado`, type: 'success', isLoading: false, autoClose: 3000,})
                addSubject({ label: body.name, description: body.description, canDelete: true, value: res.id})
                handleClose()
            })
            .catch((error: Error) => {
                toast.update(id, {render: error.message, type: "error", isLoading: false, autoClose: 3000, });
            })
    }

    return (
        <ModalTemplate>
            <div className="bg-white p-4 rounded-md max-w-4xl w-full">
                <PropValue prop="Materia" value={materia.label} />
                <PropValue prop="Frente" value={frente.label} />
                <form onSubmit={handleSubmit(create)}>
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

export default NewSubject