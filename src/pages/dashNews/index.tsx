/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import DashCardTemplate from "../../components/templates/dashCardTemplate"
import { dashNews } from "./data"
import { News } from "../../dtos/news/news";
import { getAllNews } from "../../services/news/getAllNews";
import { useAuthStore } from "../../store/auth";
import Select from "../../components/atoms/select";
import Filter from "../../components/atoms/filter";
import { CardDashInfo } from "../../components/molecules/cardDash";
import { getStatusBool } from "../../utils/getStatusIcon";
import { formatDate } from "../../utils/date";
import ModalEditNew from "./modals/modalEditNew";
import Button from "../../components/molecules/button";
import { createNews } from "../../services/news/createNews";
import { toast } from "react-toastify";
import { deleteNews } from "../../services/news/deleteNews";

function DashNews() {
    const [news, setNews] = useState<News[]>([]);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [newSelect, setNewSelect] = useState<News | null>();
    const dataRef = useRef<News[]>([])
    
    const { data: { token }} = useAuthStore()

    const handleInputChange = (event: any) => {
        const filter = event.target.value.toLowerCase();
        if(!filter) setNews(dataRef.current)
        else setNews(dataRef.current.filter(q => q.session.toLowerCase().includes(filter) || q.title.toLowerCase().includes(filter)))
    }

    const cardNews : CardDashInfo[] = news.map(n => (
        { cardId: n.id, title: n.title, status: getStatusBool(n.actived), infos: 
            [
                { field:"Session", value: n.session },
                { field:"Título", value: n.title },
                { field:"Criado em", value: n.createdAt ? formatDate(n.createdAt.toString()) : "" },
            ]
        }
    ))

    const updateActive = (active: number) => {
        setNews(dataRef.current.filter(n => n.actived == !!active))
    }

    const onClickCard = (cardId: number | string) => {
        setNewSelect(news.find(n => n.id === cardId))
        setOpenModal(true)
    }

    const create = (session: string, title: string, file: any) => {
        const formData = new FormData()
        formData.append('session', session)
        formData.append('title', title)
        formData.append('file', file, title + '.docx')

        createNews(formData, token)
            .then(res => {
                news.push(res)
                setNews(news)
                setOpenModal(false)
                toast.success(`Novidade ${res.title} criado com sucesso`, { theme: 'dark'})
            })
            .catch((error: Error) => {
                toast.error(error.message, { theme: 'dark'})
            })
    }

    const deleteNew = (id: number) => {
        deleteNews(id, token)
            .then(_ => {
                setNews(news.map(n => {
                    if(n.id === id) {
                        n.actived = false
                        return n
                    }
                    return n
                }))
                setOpenModal(false)
                toast.success(`Novidade ${newSelect?.title} deletada com sucesso`)
            })
            .catch((error: Error) => {
                toast.error(`Error - ${error.message}`)
            })
    }

    useEffect(() => {
        getAllNews(token)
            .then(res => {
                setNews(res)
                const uniqueSessions = new Set<string>();
                res.map((r) => {
                    uniqueSessions.add(r.session)
                })
                dataRef.current = res;
            })
            .catch((error: Error) => {
                toast.error(error.message)
            })
    }, [])

    const EditNews = () => {
        if(!openModal) return null
        return <ModalEditNew 
            news={newSelect!}
            create={create}
            deleteFunc={deleteNew}
            handleClose={() => { setOpenModal(false) }} />
    }
    
    return (
        <>
            <DashCardTemplate
                cardlist={cardNews} 
                title={dashNews.title} 
                filterList={[
                    <Filter placeholder="session | titulo" filtrar={handleInputChange}/>,
                    <Select options={dashNews.options} setState={updateActive} />,
                    <Button onClick={() => { setNewSelect(null); setOpenModal(true)}} typeStyle="quaternary" 
                    className="text-xl font-light rounded-full h-8 "><span className="text-4xl">+</span> upload novidade</Button>
            ]} 
                onClickCard={onClickCard} />
            <EditNews />
        </>
    )
}

export default DashNews