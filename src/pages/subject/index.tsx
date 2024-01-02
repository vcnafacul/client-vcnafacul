import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ContentDtoInput } from "../../dtos/content/contentDtoInput";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { StatusContent } from "../../enums/content/statusContent";
import { useAuthStore } from "../../store/auth";
import { getContentOrder } from "../../services/content/getContent";
import { toast } from "react-toastify";
import ContentSubject from "../../components/molecules/contentSubjects";
import Text from "../../components/atoms/text";

function Subject(){
    const { id } = useParams();
    const { data: { token }} = useAuthStore()

    const [contents, setContent] = useState<ContentDtoInput[]>([])
    const [contentSelected, setContentSelected] = useState<ContentDtoInput>()
    const dataRef = useRef<ContentDtoInput[]>([])
    const VITE_BASE_FTP = import.meta.env.VITE_BASE_FTP;

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
        getContentOrder(token, StatusEnum.Approved as unknown as StatusContent, parseInt(id!))
            .then(res => {
                setContent(res)
                dataRef.current = res;
                if(res.length > 0) {
                    setContentSelected(res[0])
                }
            })
            .catch((error: Error) => {
                toast.error(error.message);
            })
        },[id, token])

    return (
        <div className="flex flex-col xl:flex-row gap-4 flex-wrap justify-center">
            {contents.length > 0 ? <Text className="m-0 pt-4">{contents[0].subject.name}</Text> : <></>}
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
    )
}

export default Subject