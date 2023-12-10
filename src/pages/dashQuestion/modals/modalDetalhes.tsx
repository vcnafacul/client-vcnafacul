/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react";
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
import { UpdateQuestion } from "../../../dtos/question/updateQuestion";
import { useForm } from 'react-hook-form';
import ModalConfirmCancelMessage from "../../../components/organisms/modalConfirmCancelMessage";
import ModalConfirmCancel from "../../../components/organisms/modalConfirmCancel";
import { Alternatives } from "../../../types/question/alternative";
import Alternative from "../../../components/atoms/alternative";
import { useAuthStore } from "../../../store/auth";
import { Roles } from "../../../enums/roles/roles";

interface ModalDetalhesProps extends ModalProps {
    question: Question
    infos: InfoQuestion;
    handleUpdateQuestionStatus: (status: StatusEnum, message?: string) => void;
    handleUpdateQuestion: (questionUpdate: UpdateQuestion) => void;
}

function ModalDetalhes({ question, infos, handleClose, handleUpdateQuestionStatus, handleUpdateQuestion } : ModalDetalhesProps) {
    const { register, handleSubmit, watch, reset } = useForm();
    const [ isEditing, setIsEditing ] = useState<boolean>(false);
    const [photoOpen, setPhotoOpen] = useState<boolean>(false);
    const [refuse, setRefuse] = useState<boolean>(false);
    const [modified, setModified] = useState<boolean>(false);
    const [comeBack, setComeback]= useState<boolean>(false);
    const [alternative, setAlternative] = useState<string>(question.alternativa)

    const { data: { permissao }} = useAuthStore();
 
    const resetAsyncForm = useCallback(async () => {
        reset(question); // asynchronously reset your form values
      }, [question, reset]);

    const exames : FormFieldOption[] = infos.exames.map(e => ({ label: e.nome, value: e._id }))

    const materias : FormFieldOption[] = infos.materias.map(m => ({ label: m.nome, value: m._id }))

    const frentes : FormFieldOption[] = infos.frentes.map(f => ({ label: f.nome, value: f._id }))
    frentes.push({ label: '', value: ''})

    const listFieldClassification : FormFieldInput[]= [
        {id: "id", type: "text", label: "ID da questão", value: question._id, disabled: true,},
        {id: "exame",  type: "option", label: "Exame:*", options: exames, value: question.exame, disabled: !isEditing,},
        {id: "ano", type: "number", label: "Ano:*", value: question.ano, disabled: !isEditing,},
        {id: "edicao", type: "text", label: "Edição:*", options: Edicao, value: question.edicao, disabled: !isEditing,},
        {id: "caderno", type: "option", label: "Cor do Caderno:*", options: ArrayCor, value: question.caderno, disabled: !isEditing,},
        {id: "numero", type: "number", label: "Número da Questão do Caderno:*", value: question.numero, disabled: !isEditing,},
        {id: "enemArea", type: "option", label: "Área do Conhecimento:*", options: AreaEnem, value: question.enemArea, disabled: !isEditing,},
        {id: "materia", type: "option", label: "Disciplina:*", options: materias, value: question.materia, disabled: !isEditing,},
        {id: "frente1", type: "option", label: "Frente Principal:*", options: frentes, value: question.frente1, disabled: !isEditing,},
        {id: "frente2", type: "option", label: "Frente Secundária", options: frentes, value: question.frente2 ? question.frente2 : '', disabled: !isEditing,},
        {id: "frente3", type: "option", label: "Frente Terciária", options: frentes, value: question.frente3 ? question.frente3 : '', disabled: !isEditing,},
    ]

    const listFieldInfoQuestion : FormFieldInput[]= [
        {id: "textoQuestao", type: "textarea", label: "Texto da questão:*", value: question.textoQuestao, disabled: !isEditing,},
        {id: "textoAlternativaA", type: "text", label: "Alternativa A:", value: question.textoAlternativaA, disabled: !isEditing,},
        {id: "textoAlternativaB", type: "text", label: "Alternativa B:", value: question.textoAlternativaB, disabled: !isEditing,},
        {id: "textoAlternativaC", type: "text", label: "Alternativa C:", value: question.textoAlternativaC, disabled: !isEditing,},
        {id: "textoAlternativaD", type: "text", label: "Alternativa D:", value: question.textoAlternativaD, disabled: !isEditing,},
        {id: "textoAlternativaE", type: "text", label: "Alternativa E:", value: question.textoAlternativaE, disabled: !isEditing,}, 
    ]


    const QuestionImageModal = () => {
        if(!photoOpen) return null
        return <ModalImage handleClose={() => setPhotoOpen(false) }  image={`https://api.vcnafacul.com.br/images/${question.imageId}.png`} />
    }

    const handleSave = (data: any) => {
        data['_id'] = question._id
        if(alternative != question.alternativa) {
            data['alternativa'] = alternative
        }
        handleUpdateQuestion(data)
        handleClose()
    } 

    const btns: BtnProps[] = [
        { children: "Aceitar", type: 'button', onClick: () => { handleUpdateQuestionStatus(StatusEnum.Approved) }, status: StatusEnum.Approved, className: 'bg-green2 col-span-1', editing: false, disabled: !permissao[Roles.validarQuestao]},
        { children: "Rejeitar", type: 'button', onClick: () => { setRefuse(true) }, status: StatusEnum.Rejected, className: 'bg-red col-span-1', editing: false, disabled: !permissao[Roles.validarQuestao]},
        { children: "Editar", type: 'button', onClick: () => { setIsEditing(true) }, editing: false, className: 'col-span-2', disabled: !permissao[Roles.validarQuestao]},
        { children: "Fechar", type: 'button', onClick: handleClose, editing: false, className: 'col-span-2'},
        { children: "Salvar", type: 'submit', editing: true, className: 'col-span-2', disabled: !permissao[Roles.validarQuestao]},
        { children: "Voltar", type: 'button', onClick: () => { modified ? setComeback(true) : setIsEditing(false) }, editing: true, className: 'col-span-2'},
    ]

    const ModalRefused = () => {
        if(!refuse) return null;
        return <ModalConfirmCancelMessage 
            text="Descreva o motivo da rejeição:"
            handleCancel={() => { setRefuse(false) }}
            handleConfirm={(message?: string) => {
                setRefuse(false)
                handleUpdateQuestionStatus(StatusEnum.Rejected, message)
            }} />
    }

    const ModalComeBack = () => {
        if(comeBack && modified) return <ModalConfirmCancel
        text="Suas alterações ainda não foram salvas. Se você sair agora, perderá todas as alterações. Deseja continuar?"
        handleCancel={() => { setComeback(false) }}
        handleConfirm={() => { setComeback(false); resetAsyncForm(); setModified(false); setIsEditing(false) }}
    />
        return null;
    }

    useEffect(() => {
        const subscription = watch(() => { setModified(true) });
        return () => subscription.unsubscribe();
      }, [watch]);

    return (
        <>
            <form onSubmit={handleSubmit(handleSave)} className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-7 gap-x-4">
                <div className="col-span-2 flex flex-col">
                    <Text className="flex w-full justify-center gap-4 items-center" size="tertiary">Informação do Cursinho {getStatusIcon(question.status)}</Text>
                    <Form className="grid grid-cols-1 gap-y-1 mb-1" formFields={listFieldClassification} register={register} />
                </div>
                <div className="col-span-3">
                    <Text className="flex w-full justify-center gap-4 items-center" size="tertiary">Informações da Questão</Text>
                    <Form className="grid grid-cols-1 gap-y-1 mb-1" formFields={listFieldInfoQuestion} register={register} />
                    <div className="flex gap-1">
                        <Text size="secondary" className="text-orange w-60 text-start m-0">Selecione uma resposta</Text>
                        {Alternatives.map(alt => (
                            <Alternative key={alt.label} type="button" onClick={() => {setAlternative(alt.label)}} disabled={!isEditing} label={alt.label} select={alt.label === alternative} />
                        ))}
                    </div>
                </div>
                <div className="col-span-2">
                    <Text className="flex w-full justify-center gap-4 items-center" size="tertiary">Imagem da Questão</Text>
                    <img className="max-h-96 bg-lightGray p-[1px] w-full mr-4 sm:m-0 cursor-pointer" src={`https://api.vcnafacul.com.br/images/${question.imageId}.png`} onClick={() => setPhotoOpen(true)} />
                    <div className="grid grid-cols-2 gap-1">
                        {btns.map((btn, index) => {
                            if(isEditing === btn.editing){
                                return (
                                    <div key={index} className={`${btn.className} rounded`}>
                                        <Button disabled={btn.disabled} type={btn.type} onClick={btn.onClick} hover className={`${btn.className} w-full border-none`}>{btn.children}</Button>
                                    </div>
                                )
                            }
                        })}
                    </div>
                </div>
            </form>
            <QuestionImageModal />
            <ModalRefused />
            <ModalComeBack />
        </>
    )
}

export default ModalDetalhes