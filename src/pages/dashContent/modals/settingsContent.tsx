/* eslint-disable @typescript-eslint/no-unused-vars */
import { useCallback, useEffect, useState } from "react"
import Button from "../../../components/molecules/button"
import ModalTemplate, { ModalProps } from "../../../components/templates/modalTemplate"
import NewFrente from "./newFrente"
import NewSubject from "./newSubject"
import Text from "../../../components/atoms/text"
import FormField, { FormFieldOption } from "../../../components/molecules/formField"
import { MateriasLabel } from "../../../types/content/materiasLabel"
import { useForm } from "react-hook-form"
import { Materias } from "../../../enums/content/materias"
import { getFrenteLikeFormField } from "../../../services/content/getFrentes"
import { toast } from "react-toastify"
import { useAuthStore } from "../../../store/auth"
import { getSubjectsLikeFormField } from "../../../services/content/getSubjects"
import { ReactComponent as EditIcon } from '../../../assets/icons/edit.svg'
import { ReactComponent as Deleteicon } from '../../../assets/icons/delete.svg'
import EditFrente from "./editFrente"
import EditSubject from "./editSubject"
import { deleteSubject } from "../../../services/content/deleteSubject"
import { deleteFrente } from "../../../services/content/deleteFrente"

interface SettingsContentProps extends ModalProps {

}

export interface FormFieldOptionDelete extends FormFieldOption {
    canDelete: boolean;
}

export interface FormFieldOptionSubject extends FormFieldOptionDelete {
    description: string;
}

function SettingsContent({handleClose} : SettingsContentProps) {
    const { register, watch, setValue } = useForm();

    const [openNewModalFrente, setOpenNewModalFrente]= useState<boolean>(false)
    const [openEditModalFrente, setOpenEditModalFrente]= useState<boolean>(false)
    const [openNewModalSubject, setOpenNewModalSubject]= useState<boolean>(false)
    const [openEditModalSubject, setOpenEditModalSubject]= useState<boolean>(false)
    const [frentes, setFrentes ] = useState<FormFieldOptionDelete[]>([])
    const [frenteSelected, setFrenteSelected] = useState<FormFieldOptionDelete | null>()
    const [subjects, setSubjects] = useState<FormFieldOptionSubject[]>([])
    const [subjectSelected, setSubjectSelected] = useState<FormFieldOptionSubject>()

    const { data: { token }} = useAuthStore()
    const materia = watch('materia')

    const getFrenteByMateria = useCallback(async (materia: Materias) => {
        getFrenteLikeFormField(materia ? materia : Materias.LPT, token)
            .then(res => {
                setFrentes(res)
                if(res.length > 0) {
                    setValue('frente', res[0].value)
                    setFrenteSelected(res[0])
                } else {
                    setValue('frente', '')
                }
            })
            .catch((error: Error) => {
                toast.error(error.message)
            })
    }, [setValue, token])

    const getSubjectByFrente = useCallback(async (frente: number) => {
        getSubjectsLikeFormField(frente, token)
            .then(res => {
                setSubjects(res)
                if(res.length > 0) {
                    setValue('subjectId', res[0].value)
                } else {
                    setValue('subjectId', '')
                }
            })
            .catch((error: Error) => {
                toast.error(error.message)
            })
    }, [setValue, token])

    const removeSubject = (subjectRemoved: FormFieldOptionDelete) => {
        const idToast = toast.loading("Deletando Tema ... ")
        deleteSubject(subjectRemoved.value, token)
            .then(_ => { 
                toast.update(idToast, { render: `Tema ${subjectRemoved.label} Deletado`, type: 'success', isLoading: false, autoClose: 3000,})
                const updatedSubject = subjects.filter(subject => {
                    if(subject.value !== subjectRemoved.value) return subject
                })
                setSubjects(updatedSubject)
                if(updatedSubject.length === 0) {
                    setFrentes(frentes.map(frente => {
                        if(frente.value === frenteSelected?.value) {
                            return { value: frente.value, label: frente.label, canDelete: true }
                        }
                        return frente
                    }))
                }
            })
            .catch((error: Error) => {
                toast.update(idToast, {render: error.message, type: "error", isLoading: false, autoClose: 3000, });
            })
    }

    const removeFrente = (frenteRemoved: FormFieldOptionDelete) => {
        const idToast = toast.loading("Deletando Frente ... ")
        deleteFrente(frenteRemoved.value, token)
            .then(_ => { 
                toast.update(idToast, { render: `Frente ${frenteRemoved.label} Deletada`, type: 'success', isLoading: false, autoClose: 3000,})
                setFrentes(frentes.filter(frente => {
                    if(frente.value !== frenteRemoved.value) return frente
                }))
            })
            .catch((error: Error) => {
                toast.update(idToast, {render: error.message, type: "error", isLoading: false, autoClose: 3000, });
            })
    }
    
    const Frentes = () => frentes.map((frente, index) => (
        <div key={index} className={`flex w-full justify-between px-2 py-1 rounded-md select-none ${frente.value === frenteSelected?.value ? 'bg-blue-200' : index % 2 == 0 ? 'bg-gray-200' : 'bg-white' }`}>
            <span onClick={() => { setFrenteSelected(frente) }} className="my-1 text-base font-semibold text-marine cursor-pointer w-full">{frente.label}</span>
            <div className="flex gap-2">
                <EditIcon className="w-7 h-7 fill-marine cursor-pointer" onClick={() => { setFrenteSelected(frente); setOpenEditModalFrente(true) }} />
                {frente.canDelete ? <Deleteicon onClick={() => { removeFrente(frente) }} className="w-6 cursor-pointer"/> : <></>}
            </div>
        </div>
    ))
    
    const Subjects = () => subjects.map((subject, index) => (
        <div key={index} className={`flex w-full justify-between px-2 py-1 rounded-md select-none ${index % 2 == 0 ? 'bg-gray-200' : 'bg-white'}`}>
            <span className="my-1 text-base font-semibold text-marine">{subject.label}</span>
            <div className="flex gap-2">
                <EditIcon className="w-7 h-7 fill-marine cursor-pointer" onClick={() => { setSubjectSelected(subject); setOpenEditModalSubject(true)}} />
                {subject.canDelete ? <Deleteicon className="w-6" onClick={() => { removeSubject(subject) }}/> : <></>}
            </div>
        </div>
    ))

    const addFrente = (frente: FormFieldOptionDelete) => {
        frentes.push(frente)
        setFrentes(frentes)
    }

    const editFrente = (frenteUpdated: FormFieldOptionDelete) => {
        setFrentes(frentes.map(frente => {
            if(frente.value === frenteSelected?.value){
                return frenteUpdated
            }
            return frente
        }))
    }

    const addSubject = (subject: FormFieldOptionSubject) => {
        subjects.push(subject)
        setSubjects(subjects)
        setFrentes(frentes.map(frente => {
            if(frente.value === frenteSelected?.value){
                frente.canDelete = false
                return frente
            }
            return frente
        }))
    }

    const editSubject = (subjectUpdated: FormFieldOptionSubject) => {
        setSubjects(subjects.map(subject => {
            if(subject.value === subjectUpdated.value){
                return subjectUpdated
            }
            return subject
        }))
    }

    const NewModalFrente = () => {
        if(!openNewModalFrente) return null
        return <NewFrente 
        materia={MateriasLabel.find(m => m.value == materia)!}
        addFrente={addFrente}
        handleClose={() => setOpenNewModalFrente(false)} />
    }

    const EditModalFrente = () => {
        if(!openEditModalFrente) return null
        return <EditFrente 
            frente={frenteSelected!}  
            materia={MateriasLabel.find(m => m.value == materia)!} 
            editFrente={editFrente}
            handleClose={() => setOpenEditModalFrente(false)} />
    }

    const NewModalSubject = () => {
        if(!openNewModalSubject || !frenteSelected || materia === undefined) return null
        return <NewSubject 
            materia={MateriasLabel.find(m => m.value == materia)!} 
            frente={frenteSelected} 
            addSubject={addSubject}
            handleClose={() => setOpenNewModalSubject(false)} />
    }

    const EditModalSubject = () => {
        if(!openEditModalSubject || !frenteSelected || !materia) return null
        return <EditSubject 
            materia={MateriasLabel.find(m => m.value == materia)!} 
            frente={frenteSelected}
            subject={subjectSelected!}
            editSubject={editSubject}
            handleClose={() => setOpenEditModalSubject(false)} />
    }

    useEffect(()=> {
        if(!materia){
            setValue('materia', MateriasLabel[0].value)
        }
        getFrenteByMateria(materia)
    },[getFrenteByMateria, materia, setValue])

    useEffect(() => {
        if(frenteSelected) {
            getSubjectByFrente(frenteSelected?.value)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getSubjectByFrente, materia, token, frenteSelected])

    return (
        <>
            <ModalTemplate>
                <div className="bg-white p-4 w-3/4 grid grid-cols-1 md:grid-cols-2 relative gap-x-4">
                    <div className="col-span-1 col-start-1 row-start-1 flex flex-col relative h-[30vh] md:h-[60vh]">
                        <div className="flex gap-10  justify-center items-center h-16">
                            <Text className="m-0" size="secondary">Frentes</Text>
                            <FormField register={register} id={'materia'} type="option" label="Materia" options={MateriasLabel} value={MateriasLabel[0].value}/>
                        </div>
                        <div className="w-80 my-4 self-center">
                            <Button className="bg-green2 border-green2" size="small" onClick={() => { setOpenNewModalFrente(true) }}>Criar Nova Frente</Button>
                        </div>
                        <div className="flex flex-col overflow-y-auto scrollbar-hide h-full border border-b-0 p-4 mb-4">
                            <Frentes />
                        </div>
                    </div>
                    <div className="col-span-1 col-start-1 md:col-start-2 row-start-2 md:row-start-1 flex flex-col relative h-[30vh] md:h-[60vh]">
                        <div className=" h-20 flex justify-center items-center"><Text className="m-0" size="secondary">Temas</Text></div>
                        <div className="w-80 my-4 self-center">
                            <Button disabled={!frenteSelected || materia === undefined} className="bg-green2 border-green2" size="small" onClick={() => { setOpenNewModalSubject(true) }}>Criar Novo Tema</Button>
                        </div>
                        <div className="flex flex-col overflow-y-auto scrollbar-hide h-full border border-b-0 p-4 mb-4">
                            <Subjects />
                        </div>
                    </div>
                    <div className="mt-4 col-span-2">
                        <Button onClick={handleClose}>Fechar</Button>
                    </div>
                </div>
            </ModalTemplate>
            <NewModalFrente />
            <NewModalSubject />
            <EditModalFrente />
            <EditModalSubject />
        </>
    )
}

export default SettingsContent