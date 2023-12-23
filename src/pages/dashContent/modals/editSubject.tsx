/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form"
import Button from "../../../components/molecules/button"
import { FormFieldInput, FormFieldOption } from "../../../components/molecules/formField"
import Form from "../../../components/organisms/form"
import ModalTemplate, { ModalProps } from "../../../components/templates/modalTemplate"
import { toast } from "react-toastify"
import { useAuthStore } from "../../../store/auth"
import PropValue from "../../../components/molecules/PropValue"
import { FormFieldOptionSubject } from "./settingsContent"
import { UpdateSubjectDtoOutput } from "../../../dtos/content/SubjectDto"
import { updateSubject } from "../../../services/content/updateSubject"

interface EditSubjectProps extends ModalProps {
    materia: FormFieldOption;
    frente: FormFieldOption;
    subject: FormFieldOptionSubject;
    editSubject: (subjectUpdated: FormFieldOptionSubject) => void;
}

function EditSubject({ handleClose, materia, frente, subject, editSubject } : EditSubjectProps){
    const {register, handleSubmit } = useForm();

    const { data: { token }} = useAuthStore()

    const listFields : FormFieldInput[] = [
        {id: 'name', type: 'text', label: 'Nome', value: subject.label, className: 'col-span-2', validation: {
            required: `Você precisa definir um Título`,
            minLength: { value: 1}
        }},
        {id: 'description', type: 'textarea', label: 'Descricao',  value: subject.description, className: 'col-span-2', validation: {
            required: `Você precisa definir um Título`,
            minLength: { value: 1}
        }},
    ]

    const edit = (data: any) => {
        const body : UpdateSubjectDtoOutput = {
            id: subject.value,
            name: data.name,
            description: data.description
        }
        const id = toast.loading("Editando Tema ... ")
        updateSubject(body, token)
            .then(_ => {
                toast.update(id, { render: `Tema Editado`, type: 'success', isLoading: false, autoClose: 3000,})
                editSubject({ label: body.name, description: body.description, value: body.id, canDelete: subject.canDelete})
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
                <form onSubmit={handleSubmit(edit)}>
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

export default EditSubject
