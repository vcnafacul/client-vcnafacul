import { useCallback, useEffect, useRef, useState } from "react";
import DashCardTemplate from "../../components/templates/dashCardTemplate" 
import { StatusEnum } from "../../types/geolocation/statusEnum";
import { dashCardMenuItems, headerDash } from "../dash/data"
import { dashGeo } from "./data"
import Select from "../../components/atoms/select";
import Filter from "../../components/atoms/filter";
import { Geolocation } from "../../types/geolocation/geolocation";
import { CardDashProps } from "../../components/molecules/cardDash";
import { getAllGeolocation } from "../../services/geolocation/getAllGeolocation";
/* import { useAuthStore } from "../../store/auth"; */
import { formatDate } from "../../utils/date";
import ModalEditDashGeo from "./modals/modalEditDashGeo";

function DashGeo(){
    const [status, setStatus] = useState<StatusEnum>(StatusEnum.Pending);
    const [geolocations, setGeolocations] = useState<Geolocation[]>([]);
    const [geoSelect, setGeoSelect] = useState<Geolocation>();
    const [openModal, setOpenModal] = useState<boolean>(false);
    const dataRef = useRef<Geolocation[]>([])

    /* const { data: { token }} = useAuthStore() */

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleInputChange = (event: any) => {
        const filter = event.target.value.toLowerCase();
        if(!filter) setGeolocations(dataRef.current)
        else setGeolocations(dataRef.current.filter(geo => 
        geo.name.toLowerCase().includes(filter) || 
        geo.state.toLowerCase().includes(filter) || 
        geo.city.toLowerCase().includes(filter) || 
        geo.email.toLowerCase().includes(filter)))
    }

    const cardGeo : CardDashProps[] = geolocations.map(geo => (
            {cardId: geo.id, title: geo.name, status: geo.status, infos: 
                [
                    { field: 'Estado', value: geo.state},
                    { field: 'Cidade', value: geo.city},
                    { field: 'Data de Cadastro', value: formatDate(geo.createdAt)},
                    { field: 'Ultima Atualizacao', value: formatDate(geo.updatedAt)}
                ]
            }
    ))

    const onClickCard = (cardId: number) => {
        setGeoSelect(geolocations.find(geo => geo.id === cardId))
        setOpenModal(true)
    }

    const handleCloseModalEdit = () => { setOpenModal(false) }

    const ModalEdit = () => {
        if(!openModal) return null
        return <ModalEditDashGeo geo={geoSelect!} handleClose={handleCloseModalEdit} />
        
    }

    const getGeolocations = useCallback(async (status: StatusEnum) => {
        getAllGeolocation(status)
            .then(res => { 
                setGeolocations(res)
                dataRef.current = res
            })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .catch(_ => setGeolocations([]))
    }, []);

    useEffect(() => {
        getGeolocations(status)
    }, [status, getGeolocations])

    return (
        <>
            <DashCardTemplate 
                header={headerDash} 
                dashCardList={dashCardMenuItems}
                title={dashGeo.title}
                filterList={[
                    <Filter placeholder="nome | estado | cidade | email" filtrar={handleInputChange}/>, 
                    <Select  options={dashGeo.options}  defaultValue={status}  setState={setStatus} />]}
                cardlist={cardGeo}
                onClickCard={onClickCard} />
            <ModalEdit />
        </>
    )
}

export default DashGeo