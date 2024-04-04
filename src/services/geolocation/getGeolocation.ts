import { Geolocation } from "../../types/geolocation/geolocation";
import fetchWrapper from "../../utils/fetchWrapper";
import { Paginate } from "../../utils/paginate";
import { geolocations } from "../urls";

const getGeolocation = async (page:number = 1, limit:number = 30) : Promise<Paginate<Geolocation>> => {
    const response = await fetchWrapper(`${geolocations}?page=${page}&limit=${limit}`, {
        headers: { "Content-Type": "application/json" },
    });
    
    if(response.status !== 200) {
        return {
            data: [] as Geolocation[],
            page: 1,
            limit: 0,
            totalItems: 0
        }
    }
    return await response.json()
}

export default getGeolocation 