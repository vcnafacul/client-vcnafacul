/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react"
import Button from "../../../components/molecules/button"
import ModalTemplate, { ModalProps } from "../../../components/templates/modalTemplate"
import { getInfosQuestion } from "../../../services/question/getInfosQuestion"
import { useAuthStore } from "../../../store/auth"
import { ObjDefault } from "../../../dtos/question/QuestionDTO"
import { toast } from "react-toastify"
import { FormFieldInput, FormFieldOption } from "../../../components/molecules/formField"
import Form from "../../../components/organisms/form"
import { useForm } from "react-hook-form"
import Text from "../../../components/atoms/text"
import UploadButton from "../../../components/molecules/uploadButton"
import { Edicao, edicaoArray } from "../../../enums/prova/edicao"
import { createProva } from "../../../services/prova/createProva"
import { CreateProva, Prova } from "../../../dtos/prova/prova"
import { ITipoSimulado } from "../../../dtos/simulado/tipoSimulado"

interface NewProvaProps extends ModalProps {
    addProva: (data: Prova) => void;
    tipos: ITipoSimulado[];
}

function NewProva({ handleClose, addProva, tipos} : NewProvaProps){
    const {register, handleSubmit, watch } = useForm();
    const [ exames, setExames] = useState<ObjDefault[]>([])
    const { data: { token }} = useAuthStore()
    const [uploadFile, setUploadFile ] = useState(null);

    const getInfors = useCallback(async () => {
        getInfosQuestion(token)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then((infos: any) => {
                setExames(infos.exames)
            })
            .catch((erro: Error) => {
                toast.error(erro.message)
            })
    }, [token])

    let examesOptions : FormFieldOption[] = []
    examesOptions.push({ label: '', value: ''})
    examesOptions = examesOptions.concat(exames.map(f => ({ label: f.nome, value: f._id })))

    const tiposOptions : FormFieldOption[] = []
    tiposOptions.push({ label: '', value: ''})
    tipos.map(f => {        if(f.nome.includes('Enem')){
            tiposOptions.push({ label: f.nome, value: f._id }) 
        }
    })

    const edicaoOption : FormFieldOption[] = edicaoArray.map(f => ({ label: f, value: f }))
    edicaoOption.push({ label: '2ªAplicação', value: 'Reaplicação/PPL2'})
    edicaoOption.push({ label: '3ªAplicação', value: 'Reaplicação/PPL3'})

    const handleFileUpload = (e: any) => {
        setUploadFile(null)
        const file = e.target.files[0];
        if(file){
            setUploadFile(file);
        }
    };

    useEffect(() => {
        getInfors()
    }, [getInfors])

    const listFieldProva : FormFieldInput[]= [
        {id: "exame", type: "option", options: examesOptions, value: '', label: "Exame", disabled: false},
        {id: "tipo", type: "option", options: tiposOptions, value: '', label: "Tipo", disabled: false},
        {id: "edicao", type: "option", options: edicaoOption , label: "Edicao", disabled: false},
        {id: "ano", type: "number", label: "Ano de Realização", value: 2023, disabled: false},
    ]

    const exame = watch('exame')
    const tipo = watch('tipo')

    const create = (data: any) => {
        if(!uploadFile){
            toast.error('É necessaria fazer o upload do arquivo')
        }
        else {
            const id = toast.loading("Criando Prova ... ")
            const info = data as CreateProva
            info.aplicacao = 1
            if(info.edicao.includes('2')){
                info.edicao = Edicao.Regular
                info.aplicacao = 2
            }
            if(info.edicao.includes('3')){
                info.edicao = Edicao.Regular
                info.aplicacao = 3
            }

            const fileName = Date.now();
            const formData = new FormData()
            formData.append('exame', info.exame)
            formData.append('tipo', info.tipo)
            formData.append('edicao', info.edicao)
            formData.append('ano', info.ano.toString())
            formData.append('aplicacao', info.aplicacao.toString())
            formData.append('file', uploadFile!, `${fileName}.pdf`)
            createProva(formData, token)
                .then((res) => {
                    addProva(res)
                    const title = `${info.exame}_${info.ano}_${info.edicao}_${info.aplicacao}`
                    toast.update(id, { render: `Prova ${title} criada com sucesso`, type: 'success', isLoading: false, autoClose: 3000,})
                    handleClose()
                })
                .catch((error: Error) => {
                    toast.update(id, {render: error.message, type: "error", isLoading: false, autoClose: 3000, });
                })
            }
    }

    return (
        <ModalTemplate>
            <div className="p-4 bg-white rounded mx-4 w-full max-w-3xl">
                <Text>Cadastro de Prova</Text>
                <form className="flex flex-col w-full gap-4" onSubmit={handleSubmit(create)}>
                    <Form formFields={listFieldProva} register={register} className="flex flex-wrap gap-4" />
                    <UploadButton onChange={handleFileUpload} placeholder="Upload Prova" className="self-end" accept='.pdf'/>
                    <div className="flex gap-4">
                        <Button disabled={!exame || !tipo || !uploadFile} hover>Criar</Button>
                        <Button hover type="button" onClick={handleClose}>Fechar</Button>
                    </div>
                </form>
            </div>
        </ModalTemplate>
    )
}

export default NewProva