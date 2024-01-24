import Text from "../../components/atoms/text"
import Ul from "../../components/atoms/ul"
import CardSimulate from "../../components/molecules/cardSimulate"
import { getTitle, simulateData } from "./data"
import './styles.css'
import CarouselRef from "../../components/organisms/carouselRef"
import { useNavigate } from "react-router-dom"
import { useCallback, useEffect, useState } from "react"
import NewSimulate from "./modals/newSimulate"
import { getSimuladoById } from "../../services/simulado/getSimuladoById"
import { useAuthStore } from "../../store/auth"
import { getSimuladosDefaults } from "../../services/simulado/getSimuladosDefaults"
import { SimuladoDefault } from "../../types/simulado/simuladoDefault"
import { SimuladoDefaultEnum } from "../../enums/simulado/simuladoDefaultEnum"
import { useSimuladoStore } from "../../store/simulado"
import { SIMULADO } from "../../routes/path"
import { toast } from "react-toastify"

function MainSimulate() {
    const [initialize, setInitialize]= useState<boolean>(false);
    const [simulatesDefault, setSimulatseDefault] = useState<SimuladoDefault[]>()
    const [type, setType] = useState<SimuladoDefaultEnum>()

    const { data: { token }} = useAuthStore()
    const { simuladoBegin } = useSimuladoStore()
    const navigate = useNavigate()
    

    const openModalNew = (type: SimuladoDefaultEnum) => {
        setType(type)
        setInitialize(true)
    }

    const cardsBook = simulateData.simulateCardsBook.map(card => {
            return (
                <CardSimulate key={card.id} onClick={() => {openModalNew(card.tipo)}} title={card.title} icon={card.icon} className={card.className} color={card.color}>
                    {card.subTitle}
                </CardSimulate>
            )})

    const cardsDay = simulateData.simulateCardsDay.map(card => {
        return (
            <CardSimulate key={card.id} onClick={() => {openModalNew(card.tipo)}} title={card.title} icon={card.icon} className={card.className} color={card.color}>
                <Ul childrens={card.item} />
            </CardSimulate>
        )})

    const breakpointsBook = {
        1: {
            slidesPerView: 1,
            loop: false
        },
        896: {
            slidesPerView: 2,
            centeredSlides: false,
            loop: false
        },
        1120: {
            slidesPerView: 2.2,
            centeredSlides: false,
            loop: false
        },
        1344: {
            slidesPerView: 2.5,
            centeredSlides: false,
            loop: false
        },
        1568: {
            slidesPerView: 3.1,
            centeredSlides: false,
            loop: false
        },
        1800: {
            slidesPerView: 3.4,
            centeredSlides: false,
            loop: false
        },
        2277: {
            slidesPerView: 4,
            centeredSlides: false
        },
      }

    const breakpointsDay = {
        1: {
            slidesPerView: 1,
            centeredSlides: true,
            loop: false
        },
        1200: {
            slidesPerView: 1.25,
            centeredSlides: true,
            loop: false
        },
        1300: {
            slidesPerView: 1.5,
            centeredSlides: true,
            loop: false
        },
        1500: {
            slidesPerView: 2,
            centeredSlides: false,
        },
      }

    const getSimulate = useCallback( (id: string) => {
        getSimuladoById(id, token)
            .then(res => {
                simuladoBegin(res)
                navigate(SIMULADO)
                toast.success(`Iniciado Simulado ${res.title}`)
            })
            .catch((error: Error) => {
                toast.error(`Erro ao buscar simulado ${id} - Error ${error.message}`)
                setInitialize(false)
            })
    },[])

    const ModalNewSimulate = () => {
        if(!initialize) return null
        return <NewSimulate title={getTitle(type!)} 
        handleClose={() => { setInitialize(false) }}
        initialize={() => { 
            const id = simulatesDefault?.find(s => s.type === type)?.id
            getSimulate(id!)
         }}
        />
    }

    useEffect(() => {
        getSimuladosDefaults(token)
            .then(res => {
                setSimulatseDefault([
                    {type: SimuladoDefaultEnum.Linguagens, id: res.Linguagens},
                    {type: SimuladoDefaultEnum.Natureza, id: res.CienciasDaNatureza},
                    {type: SimuladoDefaultEnum.Humanas, id: res.CienciasHumanas},
                    {type: SimuladoDefaultEnum.Matematica, id: res.Matematica},
                    {type: SimuladoDefaultEnum.Enem1, id: res.Enem1},
                    {type: SimuladoDefaultEnum.Enem2, id: res.Enem2},
                ])
            })
            .catch((erro: Error) => {
                toast.error(erro.message)
            }) 
    }, [])

    return (
        <>
                <div className="relative">
                    <div className="relative sm:mx-10">
                        <div className="flex flex-col items-start pt-28 mb-20">
                            <Text size="primary" className="mb-1">{simulateData.titleBook}</Text>
                            <Text size="tertiary" className="text-xl">{simulateData.subTitleBook}</Text>
                            <CarouselRef className="w-full" childrens={cardsBook} breakpoints={breakpointsBook} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-10 gap-8">
                            <div className="flex flex-col items-start sm:col-span-1 md:col-span-3">
                                <Text size="primary">{simulateData.titleDay}</Text>
                                <Text size="tertiary" className="text-start text-xl mt-8">{simulateData.subTitleDay}</Text>
                            </div>
                            <div className="sm:col-span-2 md:col-span-7 flex justify-center">
                            <CarouselRef className="w-[448px] md:w-full" childrens={cardsDay} breakpoints={breakpointsDay} />
                            </div>
                        </div>
                    </div>
                </div>
            <ModalNewSimulate />
        </>
    )
}

export default MainSimulate