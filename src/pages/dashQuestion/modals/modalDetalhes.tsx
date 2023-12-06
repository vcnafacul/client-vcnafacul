/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Text from "../../../components/atoms/text";
import Button from "../../../components/molecules/button"
import { FormFieldInput, FormFieldOption } from "../../../components/molecules/formField";
import Form from "../../../components/organisms/form";
import { ModalProps } from "../../../components/templates/modalTemplate"
import { Question } from "../../../dtos/question/QuestionDTO"
import { InfoQuestion } from "../../../types/question/infoQuestion";
import { getStatusIcon } from "../../../utils/getStatusIcon";
import { AreaEnem, ArrayCor, Edicao } from "../data";
import ModalImage from "../../../components/atoms/modalImage";
import { BtnProps } from "../../../types/generic/btnProps";
import { StatusEnum } from "../../../types/generic/statusEnum";
import { ConverteQuestiontoUpdateQuestion, UpdateQuestion } from "../../../dtos/question/updateQuestion";

interface ModalDetalhesProps extends ModalProps {
    question: Question
    infos: InfoQuestion;
    handleUpdateQuestionStatus: (status: StatusEnum) => void;
    handleUpdateQuestion: (questionUpdate: UpdateQuestion) => void;
}

function ModalDetalhes({ question, infos, handleClose, handleUpdateQuestionStatus, handleUpdateQuestion } : ModalDetalhesProps) {
    const [ isEditing, setIsEditing ] = useState<boolean>(false);
    const [newState, setNewState] = useState<Question>(question)
    const [photoOpen, setPhotoOpen] = useState<boolean>(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleInputChange = (event: any) => {
        const { name, value } = event.target;
        setNewState({ ...newState, [name]: value });
    };

    const exames : FormFieldOption[] = infos.exames.map(e => ({ label: e.nome, value: e._id }))
    exames.push({ label: '', value: ''})

    const materias : FormFieldOption[] = infos.materias.map(m => ({ label: m.nome, value: m._id }))
    materias.push({ label: '', value: ''})

    const frentes : FormFieldOption[] = infos.frentes.map(f => ({ label: f.nome, value: f._id }))
    frentes.push({ label: '', value: ''})

    const listFieldClassification : FormFieldInput[]= [
        {id: "id", type: "text", label: "ID da questão", value: newState._id, disabled: !isEditing,},
        {id: "exame",  type: "option", label: "Exame:*", options: exames, value: newState.exame._id, disabled: !isEditing,},
        {id: "ano", type: "number", label: "Ano:*", value: newState.ano, disabled: !isEditing,},
        {id: "edicao", type: "text", label: "Edição:*", options: Edicao, value: newState.edicao, disabled: !isEditing,},
        {id: "cor", type: "option", label: "Cor do Caderno:*", options: ArrayCor, value: newState.caderno, disabled: !isEditing,},
        {id: "numero", type: "number", label: "Número da Questão do Caderno:*", value: newState.numero, disabled: !isEditing,},
        {id: "area", type: "option", label: "Área do Conhecimento:*", options: AreaEnem, value: newState.enemArea, disabled: !isEditing,},
        {id: "materia", type: "option", label: "Disciplina:*", options: materias, value: newState.materia._id, disabled: !isEditing,},
        {id: "frente1", type: "option", label: "Frente Principal:*", options: frentes, value: newState.frente1._id, disabled: !isEditing,},
        {id: "frente2", type: "option", label: "Frente Secundária", options: frentes, value: newState.frente2 ? newState.frente2._id : '', disabled: !isEditing,},
        {id: "frente3", type: "option", label: "Frente Terciária", options: frentes, value: newState.frente3 ? newState.frente3._id : '', disabled: !isEditing,},
    ]

    const listFieldInfoQuestion : FormFieldInput[]= [
        {id: "texto", type: "textarea", label: "Texto da questão:*", value: newState.textoQuestao, disabled: !isEditing,},
        {id: "alterativa1", type: "text", label: "Alternativa A:", value: newState.textoAlternativaA, disabled: !isEditing,},
        {id: "alterativa2", type: "text", label: "Alternativa B:", value: newState.textoAlternativaB, disabled: !isEditing,},
        {id: "alterativa3", type: "text", label: "Alternativa C:", value: newState.textoAlternativaC, disabled: !isEditing,},
        {id: "alterativa4", type: "text", label: "Alternativa D:", value: newState.textoAlternativaD, disabled: !isEditing,},
        {id: "alterativa5", type: "text", label: "Alternativa E:", value: newState.textoAlternativaE, disabled: !isEditing,}, 
    ]

    

    const QuestionImageModal = () => {
        if(!photoOpen) return null
        return <ModalImage handleClose={() => setPhotoOpen(false) }  image={`https://api.vcnafacul.com.br/images/${newState.imageId}.png`} />
    }

    const handleSave = () => {
        const updateQuestion = ConverteQuestiontoUpdateQuestion(newState)
        handleUpdateQuestion(updateQuestion)
        handleClose()
    } 

    const btns: BtnProps[] = [
        { children: "Aceitar", onClick: () => { handleUpdateQuestionStatus(StatusEnum.Approved) }, status: StatusEnum.Approved, className: 'bg-green2 col-span-1', editing: false},
        { children: "Rejeitar", onClick: () => { handleUpdateQuestionStatus(StatusEnum.Rejected) }, status: StatusEnum.Rejected, className: 'bg-red col-span-1', editing: false},
        { children: "Editar", onClick: () => { setIsEditing(true) }, editing: false, className: 'col-span-2'},
        { children: "Fechar", onClick: handleClose, editing: false, className: 'col-span-2'},
        { children: "Salvar", onClick: () => { handleSave }, editing: true, className: 'col-span-2'},
        { children: "Voltar", onClick: () => { setIsEditing(false)  }, editing: true, className: 'col-span-2'},
    ]

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-7 gap-x-4">
                <div className="col-span-2 flex flex-col">
                    <Text className="flex w-full justify-center gap-4 items-center" size="tertiary">Informação do Cursinho {getStatusIcon(newState.status)}</Text>
                    <Form className="grid grid-cols-1 gap-y-1 mb-1" formFields={listFieldClassification} handleOnChange={handleInputChange} />
                </div>
                <div className="col-span-3">
                    <Text className="flex w-full justify-center gap-4 items-center" size="tertiary">Informações da Questão</Text>
                    <Form className="grid grid-cols-1 gap-y-1 mb-1" formFields={listFieldInfoQuestion} handleOnChange={handleInputChange} />
                </div>
                <div className="col-span-2">
                    <Text className="flex w-full justify-center gap-4 items-center" size="tertiary">Imagem da Questão</Text>
                    <img className="max-h-96 bg-lightGray p-[1px] w-full mr-4 sm:m-0 cursor-pointer" src={`https://api.vcnafacul.com.br/images/${newState.imageId}.png`} onClick={() => setPhotoOpen(true)} />
                    <div className="grid grid-cols-2 gap-1">
                        {btns.map(btn => {
                            if(isEditing === btn.editing){
                                return (
                                    <div className={`${btn.className} rounded`}>
                                        <Button onClick={btn.onClick} hover className={`${btn.className} w-full border-none`}>{btn.children}</Button>
                                    </div>
                                )
                            }
                        })}
                    </div>
                </div>
            </div>
            <QuestionImageModal />
        </>
    )
}

export default ModalDetalhes