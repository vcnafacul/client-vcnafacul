import { useForm } from "react-hook-form";
import Button from "../../../components/molecules/button"
import { FormFieldInput, FormFieldOption } from "../../../components/molecules/formField"
import Form from "../../../components/organisms/form"
import ModalTemplate, { ModalProps } from "../../../components/templates/modalTemplate"
import { MateriasLabel } from "../../../types/content/materiasLabel";
import { useCallback, useEffect, useState } from "react";
import { getFrenteLikeFormField } from "../../../services/content/getFrentes";
import { useAuthStore } from "../../../store/auth";
import { Materias } from "../../../enums/content/materias";
import { toast } from "react-toastify";
import { getSubjectsLikeFormField } from "../../../services/content/getSubjects";
import { createContent } from "../../../services/content/createContent";
import { ContentDtoInput } from "../../../dtos/content/contentDtoInput";
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

interface NewDemandProps extends ModalProps {
    addDemand: (data: ContentDtoInput) => void;
}

function NewDemand({ handleClose, addDemand } : NewDemandProps){

    const [frentes, setFrentes ] = useState<FormFieldOption[]>([])
    const [subjects, setSubjects] = useState<FormFieldOption[]>([])

    const { data: { token }} = useAuthStore()
    

    const schema = yup
        .object()
        .shape({
            materia: yup.number().required(),
            frente: yup.number().required('Frente é obrigatória'),
            subjectId: yup.number().required('Tema é Obrigatório'),
            title: yup.string().required('Você precisa definir um Título'),
            description: yup.string().required('Você precisa definir uma descrição para essa Demanda')
        })
        .required()

    const {register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
        resolver: yupResolver(schema),
    });

    const listFields : FormFieldInput[] = [
        {id: 'materia', type: 'option', options: MateriasLabel, label: 'Materia', className: 'col-span-1'},
        {id: 'frente', type: 'option', options: frentes, label: 'Frente', className: 'col-start-2 col-span-1'},
        {id: 'subjectId', type: 'option', options: subjects, label: 'Tema', className: 'col-start-2 col-span-1'},
        {id: 'title', type: 'text', label: 'Título', className: 'col-span-2'},
        {id: 'description', type: 'textarea', label: 'Descrição', className: 'col-span-2'}
    ]

    const materia = watch("materia")
    const frente = watch("frente")

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const create = (data: any) => {
        const id = toast.loading("Criando Demanda ... ")
        createContent(data, token)
            .then(res => {
                addDemand(res)
                toast.update(id, { render: ``, type: 'success', isLoading: false, autoClose: 3000,})
                handleClose()
            })
            .catch((error: Error) => {
                toast.update(id, {render: error.message, type: "error", isLoading: false, autoClose: 3000, });
            })
    }

    const getSubjectByFrente = useCallback(async (frente: number) => {
        getSubjectsLikeFormField(frente, token)
            .then(res => {
                setSubjects(res)
                if(res.length > 0) {
                    setValue('subjectId', res[0].value as number)
                } else {
                    setValue('subjectId', null as unknown as number)
                }
            })
            .catch((error: Error) => {
                toast.error(error.message)
            })
    }, [setValue, token])

    const getFrenteByMateria = useCallback(async (materia: Materias) => {
        getFrenteLikeFormField(materia ? materia : Materias.LPT, token)
            .then(res => {
                setFrentes(res)
                if(res.length > 0) {
                    getSubjectByFrente(res[0].value as number)
                    setValue('frente', res[0].value as number)
                } else {
                    setValue('frente', null as unknown as number)
                }
                setValue('subjectId', null as unknown as number)
            })
            .catch((error: Error) => {
                toast.error(error.message)
            })
    }, [getSubjectByFrente, setValue, token])

    useEffect(() => {
        getFrenteByMateria(materia as Materias)
    }, [getFrenteByMateria, materia, token])

    useEffect(() => {
        if(frente) {
            getSubjectByFrente(frente)
        }
    }, [getSubjectByFrente, materia, frente, token])

    return (
        <ModalTemplate>
            <div className="bg-white p-4 rounded max-w-7xl w-11/12">
                <form onSubmit={handleSubmit(create)} className="flex flex-col gap-4">
                    <Form className="grid grid-cols-2 gap-1 mb-1" formFields={listFields} register={register} errors={errors} />
                    <div className="flex gap-4 col-span-2">
                        <Button type="submit">Salvar</Button>
                        <Button type="button" onClick={handleClose}>Fechar</Button>
                    </div>
                </form>
            </div>
        </ModalTemplate>
    )
    
}

export default NewDemand