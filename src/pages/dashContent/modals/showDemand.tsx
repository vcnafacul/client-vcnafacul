/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from "react";
import Text from "../../../components/atoms/text";
import PropValue from "../../../components/molecules/PropValue";
import Button from "../../../components/molecules/button";
import UploadButton from "../../../components/molecules/uploadButton";
import ModalTemplate, { ModalProps } from "../../../components/templates/modalTemplate"
import { ContentDtoInput } from "../../../dtos/content/contentDtoInput"
import Content from "../../../components/atoms/content";
import {ReactComponent as DocxIcon } from '../../../assets/icons/docx.svg'
import { useAuthStore } from "../../../store/auth";
import { Roles } from "../../../enums/roles/roles";
import ModalConfirmCancel from "../../../components/organisms/modalConfirmCancel";
import { uploadFileDemand } from "../../../services/content/uploadFileDemand";
import { toast } from "react-toastify";
import { deleteDemand } from "../../../services/content/deleteDemand";

interface ShowDemandProps extends ModalProps {
    demand: ContentDtoInput;
    updateStatusDemand: (id: number) => void;
}

function ShowDemand({ demand, handleClose, updateStatusDemand }: ShowDemandProps ){
    const [tryUpload, setTryUpload] = useState<boolean>(false);
    const [tryDelete, setTryDelete] = useState<boolean>(false);
    const [upload, setUpload] = useState<boolean>(false);
    const [arrayBuffer, setArrayBufer] = useState<ArrayBuffer>();
    const [uploadFile, setUploadFile ] = useState<any>(null);

    const { data: { permissao, token }} = useAuthStore()

    const handleFileUpload = (e: any) => {
        setUploadFile(null)
        setArrayBufer(undefined)
        setUpload(false)
        const file = e.target.files[0];
        if(file){
            setUploadFile(file);
            const reader = new FileReader();
            reader.onload = (event: any) => {
                const arrayBuffer = event.target.result;
                setUpload(true);
                setArrayBufer(arrayBuffer)
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const MyContent = useCallback(() => {
        if(upload){
            return <Content className="" arrayBuffer={arrayBuffer} />
        }
        return <div className="flex justify-center p-4">
            <DocxIcon className="w-28 h-28"/>
            <span className="h-fit border-2 border-blue-400 px-2 pt-1 rounded-t-2xl rounded-r-2xl">Eu sou o docxinho, seu amiguinho</span>
        </div>
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [upload])

    const upFile = () => {
        const id = toast.loading("Upload File Demanda ... ")
        const formData = new FormData()
        formData.append('file', uploadFile)
        uploadFileDemand(demand.id, formData, token)
            .then(_ => {
                updateStatusDemand(demand.id)
                toast.update(id, { render: `Enviado`, type: 'success', isLoading: false, autoClose: 3000,})
                handleClose()
            })
            .catch((error: Error) => {
                toast.update(id, {render: error.message, type: "error", isLoading: false, autoClose: 3000, });
            })
    }

    const ModalTryUpload = () => {
        if(!tryUpload) return null
        return (
            <ModalConfirmCancel handleCancel={() => setTryUpload(false)} handleConfirm={upFile}>
                <div>
                    <Text className="m-0" size="secondary">Tem certeza ?</Text>
                    <Text size="quaternary">Ao fazer o upload você não podera alterar mais as informações</Text>
                </div>
            </ModalConfirmCancel>
        )
    }

    const removeDemand = () => {
        const id = toast.loading("Deletando Demanda ... ")
        deleteDemand(demand.id, token)
            .then(_ => {
                updateStatusDemand(demand.id)
                toast.update(id, { render: `Deletado`, type: 'success', isLoading: false, autoClose: 3000,})
                handleClose()
            })
            .catch((error: Error) => {
                toast.update(id, {render: error.message, type: "error", isLoading: false, autoClose: 3000, });
            })
    }

    const ModalTryDelete = () => {
        if(!tryDelete) return null
        return (
            <ModalConfirmCancel handleCancel={() => setTryDelete(false)} handleConfirm={removeDemand}>
                <div>
                    <Text size="secondary">Tem certeza que deseja excluir essa demanda ?</Text>
                </div>
            </ModalConfirmCancel>
        )
    }

    const Buttons = () => {
        return (
            <div className="flex gap-4">
                <Button disabled={!uploadFile} onClick={() => setTryUpload(true)}>Salvar</Button>
                {permissao[Roles.gerenciadorDemanda] ? <Button className="bg-red" onClick={() => setTryDelete(true)}>Excluir</Button> : <></>}
                <Button onClick={handleClose}>Fechar</Button>
            </div>
        )
    }

    return (
       <>
        <ModalTemplate>
            <div className="bg-white p-4 rounded w-11/12 absolute top-4 sm:relative">
                <Text size="secondary" className="">{demand.title}</Text>
                <PropValue prop="Frente" value={demand.subject.frente.name} />
                <div className="flex flex-col">
                    <PropValue prop="Tema" value={demand.subject.name} />
                    <span className="self-end">{demand.subject.description}</span>
                </div>
                <div className="p-4">
                    <span>{demand.description}</span>
                </div>
                
                {permissao[Roles.uploadDemanda] ? 
                <>
                    <div className="overflow-y-auto scrollbar-hide w-full max-h-[50vh] border relative">
                        <MyContent />
                    </div>
                    <UploadButton placeholder="Upload" onChange={handleFileUpload}/>
                </> :
                <></>}
                <Buttons />
            </div>
        </ModalTemplate>
        <ModalTryUpload/>
        <ModalTryDelete />
       </>
    )
}

export default ShowDemand