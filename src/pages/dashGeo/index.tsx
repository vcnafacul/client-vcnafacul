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
import { useAuthStore } from "../../store/auth";
import { formatDate } from "../../utils/date";

function DashGeo(){
    const [status, setStatus] = useState<StatusEnum>(StatusEnum.Pending);
    const [geolocation, setGeolocation] = useState<Geolocation[]>([]);
    const dataRef = useRef<Geolocation[]>([])

    const { data: { token }} = useAuthStore()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleInputChange = (event: any) => {
        const filter = event.target.value.toLowerCase();
        if(!filter) setGeolocation(dataRef.current)
        else setGeolocation(dataRef.current.filter(geo => 
        geo.name.toLowerCase().includes(filter) || 
        geo.state.toLowerCase().includes(filter) || 
        geo.city.toLowerCase().includes(filter) || 
        geo.email.toLowerCase().includes(filter)))
    }

    const cardGeo : CardDashProps[] = geolocation.map(geo => (
            {cardId: geo.id, title: geo.name, status: geo.status, infos: 
                [
                    { field: 'Estado', value: geo.state},
                    { field: 'Cidade', value: geo.city},
                    { field: 'Data de Cadastro', value: formatDate(geo.createdAt)},
                    { field: 'Ultima Atualizacao', value: formatDate(geo.updatedAt)}
                ]
            }
    ))

    const getGeolocation = useCallback(async (status: StatusEnum) => {
        getAllGeolocation(status)
            .then(res => { 
                setGeolocation(res)
                dataRef.current = res
            })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .catch(_ => setGeolocation([]))
    }, []);

    useEffect(() => {
        getGeolocation(status)
    }, [status, getGeolocation])

    return (
        <DashCardTemplate 
            header={headerDash} 
            dashCardList={dashCardMenuItems}
            title={dashGeo.title}
            filterList={[
                <Filter placeholder="nome | estado | cidade | email" filtrar={handleInputChange}/>, 
                <Select  options={dashGeo.options}  defaultValue={status}  setState={setStatus} />]}
            cardlist={cardGeo}
            onClickCard={() => {}} />
    )
}

export default DashGeo