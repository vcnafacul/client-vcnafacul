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
import { AreaEnem } from "../data";
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
import { toast } from "react-toastify";
import { ReactComponent as Preview } from '../../../assets/icons/Icon-preview.svg'
import UploadButton from "../../../components/molecules/uploadButton";
import { uploadImage } from "../../../services/question/uploadImage";
import { createQuestion } from "../../../services/question/createQuestion";
import BLink from "../../../components/molecules/bLink";

interface ModalDetalhesProps extends ModalProps {
    question?: Question
    infos: InfoQuestion;
    handleUpdateQuestionStatus: (status: StatusEnum, message?: string) => void;
    handleUpdateQuestion: (questionUpdate: UpdateQuestion) => void;
    handleAddQuestion: (question: Question) => void;
}

function ModalDetalhes({ question, infos, handleClose, handleUpdateQuestionStatus, handleUpdateQuestion, handleAddQuestion } : ModalDetalhesProps) {
    const {register, handleSubmit, watch, reset } = useForm();
    const [isEditing, setIsEditing ] = useState<boolean>(false);
    const [photoOpen, setPhotoOpen] = useState<boolean>(false);
    const [refuse, setRefuse] = useState<boolean>(false);
    const [modified, setModified] = useState<boolean>(false);
    const [comeBack, setComeback]= useState<boolean>(false);
    const [alternative, setAlternative] = useState<string | undefined>(question?.alternativa)

    const [imagePreview, setImagePreview] = useState<any>(null);
    const [uploadFile, setUploadFile ] = useState<any>(null);

    const VITE_BASE_FTP = import.meta.env.VITE_BASE_FTP;

    const prova = watch("prova")

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
        previewImage(file);
        setUploadFile(file)
      };

    const { data: { permissao, token }} = useAuthStore();
 
    const resetAsyncForm = useCallback(async () => {
        reset(question); // asynchronously reset your form values
      }, [question, reset]);

    const provas : FormFieldOption[] = infos.provas.map(e => ({ label: e.nome, value: e._id }))
    provas.unshift({ label: '', value: '' })

    const materias : FormFieldOption[] = infos.materias.map(m => ({ label: m.nome, value: m._id }))

    const frentes : FormFieldOption[] = infos.frentes.map(f => ({ label: f.nome, value: f._id }))
    frentes.unshift({ label: '', value: undefined})

    const listFieldClassification : FormFieldInput[]= [
        {id: "prova",  type: "option", label: "Prova:*", options: provas, value: question?.prova ?? '', disabled: !question ? false : !isEditing,},
        {id: "ano", type: "text", label: "Ano:*", value: infos.provas.find(p => p._id === prova)?.ano ?? '', disabled: true,},
        {id: "edicao", type: "text", label: "Edição:*", value: infos.provas.find(p => p._id === prova)?.edicao.toString() ?? '', disabled: true,},
        {id: "numero", type: "number", label: "Número da Questão do Caderno:*", value: question?.numero, disabled: !question ? false : !isEditing,},
        {id: "enemArea", type: "option", label: "Área do Conhecimento:*", options: AreaEnem, value: question?.enemArea, disabled: !question ? false : !isEditing,},
        {id: "materia", type: "option", label: "Disciplina:*", options: materias, value: question?.materia, disabled: !question ? false : !isEditing,},
        {id: "frente1", type: "option", label: "Frente Principal:*", options: frentes, value: question?.frente1, disabled: !question ? false : !isEditing,},
        {id: "frente2", type: "option", label: "Frente Secundária", options: frentes, value: question?.frente2 ? question?.frente2 : '', disabled: !question ? false : !isEditing,},
        {id: "frente3", type: "option", label: "Frente Terciária", options: frentes, value: question?.frente3 ? question?.frente3 : '', disabled: !question ? false : !isEditing,},
    ]

    const listFieldInfoQuestion : FormFieldInput[]= [
        {id: "textoQuestao", type: "textarea", label: "Texto da questão:*", value: question?.textoQuestao, disabled: !question ? false : !isEditing,},
        {id: "textoAlternativaA", type: "text", label: "Alternativa A:", value: question?.textoAlternativaA, disabled: !question ? false : !isEditing,},
        {id: "textoAlternativaB", type: "text", label: "Alternativa B:", value: question?.textoAlternativaB, disabled: !question ? false : !isEditing,},
        {id: "textoAlternativaC", type: "text", label: "Alternativa C:", value: question?.textoAlternativaC, disabled: !question ? false : !isEditing,},
        {id: "textoAlternativaD", type: "text", label: "Alternativa D:", value: question?.textoAlternativaD, disabled: !question ? false : !isEditing,},
        {id: "textoAlternativaE", type: "text", label: "Alternativa E:", value: question?.textoAlternativaE, disabled: !question ? false : !isEditing,}, 
    ]


    const QuestionImageModal = () => {
        if(!photoOpen) return null
        return <ModalImage handleClose={() => setPhotoOpen(false) }  image={`https://api.vcnafacul.com.br/images/${question?.imageId}.png`} />
    }

    const handleUpdateClose = (data: any) => {
        handleUpdateQuestion(data)
        handleClose()
    }

    const handleSave = (data: any) => {
       if(question){
            data['_id'] = question._id
            if(alternative != question.alternativa) {
                data['alternativa'] = alternative
            }
            if(uploadFile) {
                const formData = new FormData()
                formData.append('file', uploadFile)
                uploadImage(formData, token)
                    .then((res: string) => {
                        data['imageId'] = res
                        handleUpdateClose(data)
                    })
                    .catch((error: Error) => {
                        toast.error(error.message)
                    })
            }
            else {
                handleUpdateClose(data)
            }
       }
       else {
        if(!alternative){
            toast.warn("Faltou preencher a alternativa correta", { theme: 'dark'})
        }
        if(!data['ano']){
            toast.warn("Faltou preencher o ano da questão", { theme: 'dark'})
        }
        if(!data['textoQuestao']){
            toast.warn("Faltou preencher o texto da questão", { theme: 'dark'})
        }
        if(!data['edicao']){
            data['edicao'] = 'Regular'
        }
        if(alternative && data['ano'] && data['textoQuestao']) {
            const formData = new FormData()
            formData.append('file', uploadFile)
            uploadImage(formData, token)
                .then((res: string) => {
                    data['imageId'] = res
                    data['alternativa'] = alternative
                    createQuestion(data, token)
                        .then((res: any) => {
                            handleAddQuestion(res)
                            handleClose()
                            toast.success(`Cadastro realizado com sucesso. Id: ${res._id}`)
                        })
                        .catch((error: any) => {
                            error.message.map((m: string) => {
                                toast.error(m, { theme: 'dark', autoClose: 3000,})
                            })
                        })
                })
                .catch((error: Error) => {
                    toast.error(error.message)
                })
           }
        }
    } 

    const btns: BtnProps[] = [
        { children: "Aceitar", type: 'button', onClick: () => { handleUpdateQuestionStatus(StatusEnum.Approved) }, status: StatusEnum.Approved, className: 'bg-green2 col-span-1', editing: false, disabled: !permissao[Roles.validarQuestao]},
        { children: "Rejeitar", type: 'button', onClick: () => { setRefuse(true) }, status: StatusEnum.Rejected, className: 'bg-red col-span-1', editing: false, disabled: !permissao[Roles.validarQuestao]},
        { children: "Editar", type: 'button', onClick: () => { setIsEditing(true) }, editing: false, className: 'col-span-2', disabled: !permissao[Roles.validarQuestao]},
        { children: "Fechar", type: 'button', onClick: handleClose, editing: false, className: 'col-span-2'},
        { children: "Salvar", type: 'submit', editing: true, className: 'col-span-2', disabled: !permissao[Roles.validarQuestao]},
        { children: "Voltar", type: 'button', onClick: () => { modified ? setComeback(true) : setIsEditing(false) }, editing: true, className: 'col-span-2'},
    ]

    const Buttons = () => {
        if(question) {
            return btns.map((btn, index) => {
                if(isEditing === btn.editing) {
                    return (
                        <div key={index} className={`${btn.className} rounded`}>
                            <Button disabled={btn.disabled} type={btn.type} onClick={btn.onClick} hover className={`${btn.className} w-full border-none`}>{btn.children}</Button>
                        </div>
                    )
                }
            })
        }
        return   <div className="flex flex-col gap-1 col-span-2">
            <Button type="submit" disabled={imagePreview === null || !permissao[Roles.criarQuestao]} >Salvar</Button>
            <Button type="button" onClick={handleClose}>Fechar</Button>
        </div>
    }

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

    const BDownloadProva = () => {
        if(!prova) return null
        return <BLink to={`${VITE_BASE_FTP}${infos.provas.find(p => p._id === prova)?.filename}`} target="_blank" className="flex" type="quaternary">Visualizar Prova</BLink>
    }

    useEffect(() => {
        const subscription = watch(() => { setModified(true) });
        return () => subscription.unsubscribe();
      }, [watch]);

    return (
        <>
            <form onSubmit={handleSubmit(handleSave)} className="grid grid-cols-1 md:grid-cols-7 gap-x-4">
                <div className="col-span-1 md:col-span-2 flex flex-col">
                    <Text className="flex w-full justify-center gap-4 items-center" size="tertiary">Informação do Cursinho {!question ? <></> : getStatusIcon(question.status)}</Text>
                    <Form className="grid grid-cols-1 gap-y-1 mb-1" formFields={listFieldClassification} register={register} />
                </div>
                <div className="col-span-1 md:col-span-3">
                    <Text className="flex w-full justify-center gap-4 items-center" size="tertiary">Informações da Questão</Text>
                    <Form className="grid grid-cols-1 gap-y-1 mb-1" formFields={listFieldInfoQuestion} register={register} />
                    <div className="flex gap-1 my-4">
                        <Text size="secondary" className="text-orange w-60 text-start m-0">Selecione uma resposta*</Text>
                        {Alternatives.map(alt => (
                            <Alternative key={alt.label} type="button" onClick={() => {setAlternative(alt.label)}} disabled={!question ? false : !isEditing} label={alt.label} select={alt.label === alternative} />
                        ))}
                    </div>
                </div>
                <div className="col-span-1 md:col-span-2">
                    <Text className="flex w-full justify-center gap-4 items-center" size="tertiary">Imagem da Questão</Text>
                    {question ? 
                        <div>
                            {imagePreview ? <img src={imagePreview}/> : 
                                <img className="max-h-96 bg-lightGray p-[1px] w-full mr-4 sm:m-0 cursor-pointer" src={`https://api.vcnafacul.com.br/images/${question?.imageId}.png`} onClick={() => setPhotoOpen(true)} />
                                }
                            {isEditing ? <UploadButton placeholder="Alterar imagem" onChange={handleImageChange} accept='.png' /> : <></>}
                        </div> : 
                        <div>
                            <div className="border py-4 flex justify-center items-center h-1/2">
                                {imagePreview ? <img src={imagePreview}/> : 
                                <Preview />}
                            </div>
                            <UploadButton placeholder="Upload Imagem" onChange={handleImageChange} accept='.png' />
                        </div>
                    }
                    <BDownloadProva />
                    <div className="grid grid-cols-2 gap-1 w-full">
                        <Buttons />
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