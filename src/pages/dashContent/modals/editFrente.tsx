/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form"
import Button from "../../../components/molecules/button"
import { FormFieldInput, FormFieldOption } from "../../../components/molecules/formField"
import Form from "../../../components/organisms/form"
import ModalTemplate, { ModalProps } from "../../../components/templates/modalTemplate"
import { UpdateFrenteDtoOutut } from "../../../dtos/content/frenteDto"
import { toast } from "react-toastify"
import { useAuthStore } from "../../../store/auth"
import PropValue from "../../../components/molecules/PropValue"
import { updateFrente } from "../../../services/content/updateFrente"
import { FormFieldOptionDelete } from "./settingsContent"

interface EditFrenteProps extends ModalProps {
    materia: FormFieldOption
    frente: FormFieldOptionDelete
    editFrente: (frente: FormFieldOptionDelete) => void;
}

function EditFrente({ handleClose, materia, frente, editFrente } : EditFrenteProps){
    const {register, handleSubmit } = useForm();

    const { data: { token }} = useAuthStore()
    
    const listFields : FormFieldInput[] = [
        {id: 'name', type: 'text', label: 'Nome', value: frente.label, className: 'col-span-2', validation: {
            required: `Você precisa definir um Título`,
            minLength: { value: 1}
        }},
    ]

    const edit = (data: any) => {
        const body : UpdateFrenteDtoOutut = {
            name: data.name,
            id: frente.value
        }
        const id = toast.loading("Editando Frente ... ")
        updateFrente(body, token)
            .then(_ => {
                toast.update(id, { render: `Frente Editada`, type: 'success', isLoading: false, autoClose: 3000,})
                editFrente({ label: body.name, value: frente.value, canDelete: frente.canDelete })
                handleClose()
            })
            .catch((error: Error) => {
                toast.update(id, {render: error.message, type: "error", isLoading: false, autoClose: 3000, });
            })
    }
    
    return (
        <ModalTemplate>
            <div className="bg-white p-4 rounded-md w-96">
                <form onSubmit={handleSubmit(edit)}>
                    <PropValue prop="Materia" value={materia.label} />
                    <Form className="flex flex-col gap-4 my-4" formFields={listFields} register={register}/>
                    <div className="flex gap-4 flex-wrap sm:flex-nowrap">
                        <Button type="submit">Salvar</Button>
                        <Button type="button" onClick={handleClose}>Fechar</Button>
                    </div>
                </form>
            </div>
        </ModalTemplate>
    )
}

export default EditFrente