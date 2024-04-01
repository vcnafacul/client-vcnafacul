/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react";
import Filter from "../../components/atoms/filter";
import Select from "../../components/atoms/select";
import DashCardTemplate from "../../components/templates/dashCardTemplate";
import { StatusEnum } from "../../enums/generic/statusEnum";
import { getAllGeolocation } from "../../services/geolocation/getAllGeolocation";
import { Geolocation } from "../../types/geolocation/geolocation";
import { formatDate } from "../../utils/date";
import { mergeObjects } from "../../utils/mergeObjects";
import { Paginate } from "../../utils/paginate";
import { dashGeo } from "./data";
import ModalEditDashGeo from "./modals/modalEditDashGeo";
import { CardDash } from "../../components/molecules/cardDash";

function DashGeo(){
    const [status, setStatus] = useState<StatusEnum>(StatusEnum.Pending);
    const [geolocations, setGeolocations] = useState<Geolocation[]>([]);
    const [geoSelect, setGeoSelect] = useState<Geolocation>();
    const [openModal, setOpenModal] = useState<boolean>(false);
    const limitCards = 40;

    const handleInputChange = (event: any) => {
        // const filter = 
            event.target.value.toLowerCase();
        //Ajustar o filter quando clicar enter
    }

    const cardTransformation = (geo: Geolocation) : CardDash => (
        {id: geo.id, title: geo.name, status: geo.status, infos: 
            [
                { field: 'Estado', value: geo.state},
                { field: 'Cidade', value: geo.city},
                { field: 'Data de Cadastro', value: formatDate(geo.createdAt)},
                { field: 'Ultima Atualizacao', value: formatDate(geo.updatedAt)}
            ]
        }
    )

    const onClickCard = (cardId: number | string) => {
        setGeoSelect(geolocations.find(geo => geo.id === cardId))
        setOpenModal(true)
    }

    const handleCloseModalEdit = () => { setOpenModal(false) }

    const updateStatus = (cardId: number) => {
        const updatedGeo = geolocations.filter(geo => {
            if(geo.id !== cardId) return geo
        })
        setGeolocations(updatedGeo)
    }

    const updateGeolocation = (geolocation: Geolocation) => {
        setGeolocations(geolocations.map(geo => {
            if(geo.id === geolocation.id) return mergeObjects(geolocation, geo)
            return geo
        }))
    }

    const ModalEdit = () => {
        if(!openModal) return null
        return <ModalEditDashGeo geo={geoSelect!} handleClose={handleCloseModalEdit} updateStatus={updateStatus} updateGeo={updateGeolocation} />
    }

    const getGeolocations = useCallback(async (status: StatusEnum) => {
        getAllGeolocation(status, 1, limitCards)
            .then(res => { 
                setGeolocations(res.data)
            })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .catch(_ => setGeolocations([]))
    }, []);

    const getMoreCards = async ( page: number) : Promise<Paginate<Geolocation>> => {
        return await getAllGeolocation(status, page, limitCards)
    }

    useEffect(() => {
        getGeolocations(status)
    }, [status, getGeolocations])

    return (
        <>
            <DashCardTemplate<Geolocation>
                title={dashGeo.title}
                entities={geolocations}
                setEntities={setGeolocations}
                cardTransformation={cardTransformation}
                onLoadMoreCard={getMoreCards}
                limitCardPerPage={limitCards}
                filterList={[
                    <Filter placeholder="nome | estado | cidade | email" filtrar={handleInputChange}/>, 
                    <Select  options={dashGeo.options}  defaultValue={status}  setState={setStatus} />]}
                onClickCard={onClickCard}
                
                />
            <ModalEdit />
        </>
    )
}

export default DashGeo