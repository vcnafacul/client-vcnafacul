/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from "react"
import Text from "../../../components/atoms/text"
import Button from "../../../components/molecules/button"
import ModalTemplate, { ModalProps } from "../../../components/templates/modalTemplate"
import { News } from "../../../dtos/news/news"
import Content from "../../../components/atoms/content"
import {ReactComponent as IconPreview} from '../../../assets/icons/Icon-preview.svg'
import Filter from "../../../components/atoms/filter"
import UploadButton from "../../../components/molecules/uploadButton"

interface ModalEditNewProps extends ModalProps{
    news: News
    create: (session: string, title: string, file: any) => void;
    deleteFunc: (id: number) => void;
}

function ModalEditNew({ news, create, deleteFunc, handleClose } : ModalEditNewProps){
    const [arrayBuffer, setArrayBufer] = useState<ArrayBuffer>();
    const [upload, setUpload] = useState<boolean>(news ? true : false);

    const [session, setSession] = useState<string>(news ? news.session : '');
    const [title, setTitle] = useState<string>(news ? news.title : '');

    const [uploadFile, setUploadFile ] = useState(null);

    const VITE_BASE_FTP = import.meta.env.VITE_BASE_FTP;

    const MyContent = useCallback(() => {
        if(news){
            return <Content className="" docxFilePath={`${VITE_BASE_FTP}${news.fileName}`} />
        }
        else if(upload){
            return <Content arrayBuffer={arrayBuffer} />
        }
        return <IconPreview />
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [upload])

    const handleFileUpload = (e: any) => {
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

    const createNew = () => {
        if(!!news || (upload && !!session && !!title)) {
            create(session, title, uploadFile)
        }
    }

    const deleteNew = () => {
        if(news){
            deleteFunc(news.id)
        }
    }

    return (
        <ModalTemplate>
            <div className="bg-white p-10 min-h-[70vh] max-h-[90vh] flex flex-col items-center">
                <Text size="secondary">Informações Básicas</Text>
                <div className="flex gap-4">
                    <Filter disabled={!!news} defaultValue={session} search={false} className="border rounded-md" filtrar={(e: any) => { setSession(e.target.value)}} placeholder="Sessão" />
                    <Filter disabled={!!news} defaultValue={title} search={false} className="border rounded-md" filtrar={(e: any) => { setTitle(e.target.value)}} placeholder="Título" />
                </div>
                <Text size="secondary">Preview Docs</Text>
                <div className="overflow-y-auto scrollbar-hide w-full max-h-[50vh] border my-4 p-4 relative">
                    <MyContent />
                </div>
                {news ? <></> : <UploadButton placeholder="Upload Novidades" onChange={handleFileUpload} />}
                <div className="flex gap-4 w-full mt-4">
                {news ? 
                    <Button 
                    className="bg-red border-red" hover 
                        onClick={deleteNew}>Deletar</Button> : 
                    <Button 
                    className="bg-green2 border-green2" hover 
                        onClick={createNew}>Salvar</Button>}

                <Button hover onClick={handleClose}>Cancelar</Button>
                </div>
            </div>
        </ModalTemplate>
    )
}

export default ModalEditNew