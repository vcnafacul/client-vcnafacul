import { StatusEnum } from "../../enums/generic/statusEnum";
import { Geolocation } from "../../types/geolocation/geolocation";
import fetchWrapper from "../../utils/fetchWrapper";
import { Paginate } from "../../utils/paginate";
import { allGeolocation } from "../urls";

export async function getAllGeolocation(status: StatusEnum, 
    page: number = 1, limit: number = 40, text: string = ''): Promise<Paginate<Geolocation>> {
    const url = `${allGeolocation}?page=${page}&limit=${limit}&status=${status}&text=${text}`;
    const res = await fetchWrapper(url, {
        headers: { "Content-Type": "application/json" },
    });
    return await res.json() 
}