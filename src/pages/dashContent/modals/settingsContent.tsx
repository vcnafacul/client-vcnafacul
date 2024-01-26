/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react"
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
import { deleteSubject } from "../../../services/content/deleteSubject"
import { deleteFrente } from "../../../services/content/deleteFrente"
import { TbArrowsExchange } from "react-icons/tb";
import ViewOrder from "./viewOrder"

interface SettingsContentProps extends ModalProps {

}

export interface FormFieldOptionFrente extends FormFieldOption {
    canDelete: boolean;
}

export interface FormFieldOptionSubject extends FormFieldOptionFrente {
    description: string;
}

function SettingsContent({handleClose} : SettingsContentProps) {
    const { register, watch } = useForm();

    const [openModalFrente, setOpenModalFrente]= useState<boolean>(false)
    const [openModalSubject, setOpenModalSubject]= useState<boolean>(false)
    const [openModalViewOrder, setOpenModalViewOrder]= useState<boolean>(false)
    const [frentes, setFrentes ] = useState<FormFieldOptionFrente[]>([])
    const [frenteSelected, setFrenteSelected] = useState<FormFieldOptionFrente | null>()
    const [subjects, setSubjects] = useState<FormFieldOptionSubject[]>([])
    const [subjectSelected, setSubjectSelected] = useState<FormFieldOptionSubject | null>(null)

    const { data: { token }} = useAuthStore()
    const materia = watch('materia', Materias.LPT)

    const getFrenteByMateria = (materia: Materias) => {
        getFrenteLikeFormField(materia, token)
            .then(res => {
                setFrentes(res)
                if(res.length > 0) {
                    getSubjectByFrente(res[0])
                }
            })
            .catch((error: Error) => {
                toast.error(error.message)
            })
    }

    const getSubjectByFrente = (frente: FormFieldOptionFrente = frenteSelected!) => {
        if(frente){
            getSubjectsLikeFormField(frente.value as number, token)
            .then(res => {
                setSubjects(res)
            })
            .catch((error: Error) => {
                toast.error(error.message)
            })
        }
    }

    const removeSubject = (subjectRemoved: FormFieldOptionFrente) => {
        const idToast = toast.loading("Deletando Tema ... ")
        deleteSubject(subjectRemoved.value as number, token)
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

    const removeFrente = (frenteRemoved: FormFieldOptionFrente) => {
        const idToast = toast.loading("Deletando Frente ... ")
        deleteFrente(frenteRemoved.value as number, token)
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
                <EditIcon className="w-7 h-7 fill-marine cursor-pointer" onClick={() => { setFrenteSelected(frente); setOpenModalFrente(true) }} />
                {frente.canDelete ? <Deleteicon onClick={() => { removeFrente(frente) }} className="w-6 cursor-pointer"/> : <></>}
            </div>
        </div>
    ))
    
    const Subjects = () => subjects.map((subject, index) => (
        <div key={index} className={`flex w-full justify-between px-2 py-1 rounded-md select-none ${index % 2 == 0 ? 'bg-gray-200' : 'bg-white'}`}>
            <span className="my-1 text-base font-semibold text-marine">{subject.label}</span>
            <div className="flex gap-2">
                <TbArrowsExchange className="w-7 h-7 rotate-90 cursor-pointer" title="Alterar Order Conteúdos" onClick={() => { setSubjectSelected(subject); setOpenModalViewOrder(true) }} />
                <EditIcon className="w-7 h-7 fill-marine cursor-pointer" onClick={() => { setSubjectSelected(subject); setOpenModalSubject(true)}} />
                {subject.canDelete ? <Deleteicon className="w-6" onClick={() => { removeSubject(subject) }}/> : <></>}
            </div>
        </div>
    ))

    const addFrente = (frente: FormFieldOptionFrente) => {
        frentes.push(frente)
        setFrentes(frentes)
    }

    const editFrente = (frenteUpdated: FormFieldOptionFrente) => {
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
        if(!openModalFrente) return null
        return <NewFrente 
        materia={MateriasLabel.find(m => m.value == materia)!}
        actionFrente={addFrente}
        handleClose={() => setOpenModalFrente(false)} />
    }

    const EditModalFrente = () => {
        if(!openModalFrente) return null
        return <NewFrente 
            frente={frenteSelected!}  
            materia={MateriasLabel.find(m => m.value == materia)!} 
            actionFrente={editFrente}
            handleClose={() => setOpenModalFrente(false)} />
    }

    const NewModalSubject = () => {
        if(!openModalSubject || !frenteSelected || materia === undefined) return null
        return <NewSubject 
            materia={MateriasLabel.find(m => m.value == materia)!} 
            frente={frenteSelected} 
            actionSubject={addSubject}
            handleClose={() => setOpenModalSubject(false)} />
    }

    const EditModalSubject = () => {
        if(!openModalSubject || !frenteSelected || !materia || !subjectSelected) return null
        return <NewSubject 
            materia={MateriasLabel.find(m => m.value == materia)!} 
            frente={frenteSelected}
            subject={subjectSelected!}
            actionSubject={editSubject}
            handleClose={() => setOpenModalSubject(false)} />
    }

    const ViewOrderModal = () => {
        if(!openModalViewOrder) return null
        return <ViewOrder 
        handleClose={() => { setOpenModalViewOrder(false) }}
        subjectId={subjectSelected!.value as number} />
    }

    useEffect(()=> {
        getFrenteByMateria(materia)
    }, [materia])

    useEffect(() => {
        if(frenteSelected) {
            getSubjectByFrente()
        }
    }, [token, frenteSelected])

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
                            <Button className="bg-green2 border-green2" size="small" onClick={() => { setOpenModalFrente(true); setFrenteSelected(null) }}>Criar Nova Frente</Button>
                        </div>
                        <div className="flex flex-col overflow-y-auto scrollbar-hide h-full border border-b-0 p-4 mb-4">
                            <Frentes />
                        </div>
                    </div>
                    <div className="col-span-1 col-start-1 md:col-start-2 row-start-2 md:row-start-1 flex flex-col relative h-[30vh] md:h-[60vh]">
                        <div className=" h-20 flex justify-center items-center"><Text className="m-0" size="secondary">Temas</Text></div>
                        <div className="w-80 my-4 self-center">
                            <Button disabled={!frenteSelected || materia === undefined} className="bg-green2 border-green2" size="small" onClick={() => { setOpenModalSubject(true); setSubjectSelected(null) }}>Criar Novo Tema</Button>
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
            <EditModalSubject />
            <EditModalFrente />
            <ViewOrderModal />
        </>
    )
}

export default SettingsContent