import { Geolocation } from "../../types/geolocation/geolocation";
import fetchWrapper from "../../utils/fetchWrapper";
import { Paginate } from "../../utils/paginate";
import { geolocations } from "../urls";

export async function getGeolocation() : Promise<Paginate<Geolocation>> {

    const res = await fetchWrapper(`${geolocations}?page=1&limit=1000&status=1&text=`, {
        headers: { "Content-Type": "application/json" },
    });

    if(res.status !== 200) {
        return {
            data: [] as Geolocation[],
            page: 1,
            limit: 0,
            totalItems: 0
        }
    }

    return await res.json()
}

export default getGeolocation
