import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ContentDtoInput } from "../../dtos/content/contentDtoInput";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { StatusContent } from "../../enums/content/statusContent";
import { useAuthStore } from "../../store/auth";
import { getContentOrder } from "../../services/content/getContent";
import { toast } from "react-toastify";
import ContentSubject from "../../components/molecules/contentSubjects";
import Text from "../../components/atoms/text";
import Button from "../../components/molecules/button";
import { DASH, ESTUDO } from "../../routes/path";
import { MateriasLabel } from "../../types/content/materiasLabel";

function Subject(){
    const { id } = useParams();
    const { data: { token }} = useAuthStore()

    const [contents, setContent] = useState<ContentDtoInput[]>([])
    const [nomeMateria, setNomeMateria] = useState<string>('')
    const [contentSelected, setContentSelected] = useState<ContentDtoInput>()
    const dataRef = useRef<ContentDtoInput[]>([])
    const VITE_BASE_FTP = import.meta.env.VITE_BASE_FTP;

    function removeAccentsAndSpecialChars(input: string): string {
        return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9 ]/g, "");
    }

    const MyContent = useCallback(() => {
        if(contentSelected){
            return (
                <ContentSubject docxFilePath={`${VITE_BASE_FTP}${contentSelected.filename}`} />
            )
        }
        return null
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contentSelected])

    useEffect(() => {
        getContentOrder(token, StatusEnum.Approved as unknown as StatusContent, id)
            .then(res => {
                setContent(res)
                const idMateria = res[0].subject.frente.materia;
                const nomeMateria = removeAccentsAndSpecialChars(MateriasLabel.find(materia => materia.value === idMateria)!.label);
                setNomeMateria(nomeMateria)
                dataRef.current = res;
                if(res.length > 0) {
                    setContentSelected(res[0])
                }
            })
            .catch((error: Error) => {
                toast.error(error.message);
            })
        },[id, token])
        const navigate = useNavigate();

    return (
        <div>
            <div className="relative flex flex-col-reverse items-center gap-2 mt-4 sm:mt-0">
                    {contents.length > 0 ? <Text className="m-0 pt-4">{contents[0].subject.name}</Text> : <></>}
                    {nomeMateria && (
                    <div>
                        <Button className="w-24 h-10 sm:absolute top-4 right-4" onClick={() => navigate(`${DASH}/${ESTUDO}/${nomeMateria}`)}>
                            Voltar
                        </Button>
                    </div>)}
                    </div>
                <div className="flex flex-col xl:flex-row gap-4 flex-wrap justify-center">
                    <div className="m-4 xl:mt-8 xl:mr-8 bg-white border shadow-md rounded-md flex gap-4 xl:flex-col h-fit flex-wrap w-fit">
                        {contents.map((content, index) => (
                            <div key={index} onClick={() => { setContentSelected(content)}}
                            className={`px-4 py-1 cursor-pointer transition-all duration-300 min-w-[120px]
                            ${content.id === contentSelected?.id ? 'font-black bg-gray-200' : ''}`}>{index + 1} - {content.title}</div>
                        ))}
                    </div>
                    <div className="px-4">
                        <MyContent />
                    </div>
                </div>
            </div>
    )
}

export default Subject