import { useRef, useState } from "react";
import DashCardTemplate from "../../components/templates/dashCardTemplate" 
import { StatusEnum } from "../../types/geolocation/statusEnum";
import { dashCardMenuItems, headerDash } from "../dash/data"
import { dashGeo } from "./data"
import Select from "../../components/atoms/select";
import Filter from "../../components/atoms/filter";
import { Geolocation } from "../../types/geolocation/geolocation";

function DashGeo(){
    const [status, setStatus] = useState<StatusEnum>(StatusEnum.Pending);
    const [filter, setFilter] = useState<string>("")
    const [geolocation, setGeolocation] = useState<Geolocation[]>([]);
    const dataRef = useRef<Geolocation[]>([])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleInputChange = (event: any) => {
        setFilter(event.target)
        if(!event.target) setGeolocation(dataRef.current)
        else setGeolocation(dataRef.current.filter(geo => geo.name.includes(filter) || geo.state.includes(filter) || geo.city.includes(filter) || geo.email.includes(filter)))
    }

    const selectStatus = <Select 
    options={dashGeo.options} 
    defaultValue={status} 
    setState={setStatus}
    />

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filterGeo = <Filter placeholder="nome | estado | cidade | email" filtrar={handleInputChange}/>

    return (
        <DashCardTemplate 
            header={headerDash} 
            dashCardList={dashCardMenuItems}
            title={dashGeo.title}
            filterList={[filterGeo, selectStatus]} />
    )
}

export default DashGeo