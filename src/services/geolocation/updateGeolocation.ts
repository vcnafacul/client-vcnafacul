/* eslint-disable @typescript-eslint/no-explicit-any */
import { GeolocationUpdateDto } from "../../dtos/geolocation/geolocationUpdateDto";
import { Geolocation } from "../../types/geolocation/geolocation";
import fetchWrapper from "../../utils/fetchWrapper";
import { geolocations } from "../urls";

interface UpdateGeolocationProps {
     
    body: any;
    token: string
}

export async function UpdateGeolocation({ body, token}: UpdateGeolocationProps){
    try {
        const response = await fetchWrapper(geolocations, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(converteGeolocationUpdateDto(body)),
        });
        if(response.status === 304){
            throw new Error("Cursinho não atualizado, não havia nenhuma modificacao realizada")
        }
        if(response.status === 400) {
            const res = await response.json()
            let messageErro = ""
            res.message.map((m: string) => messageErro =  messageErro.concat(m).concat("; "))
            throw new Error(messageErro)
        }
    } catch (error: any) {
        throw new Error(`Error - ${error.message}`)
    }
}

export async function UpdateGeolocationStatus({ body, token}: UpdateGeolocationProps){
    const response = await fetchWrapper(`${geolocations}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
    });
    if(response.status !== 200) {
        const res = await response.json()
        let messageErro = ""
        res.message.map((m: string) => messageErro =  messageErro.concat(m).concat("; "))
        throw new Error(messageErro)
    }
        
    
}

const converteGeolocationUpdateDto = (geo: Geolocation): GeolocationUpdateDto => {
    const noneFields = new Set(['createdAt', 'updatedAt', 'deletedAt', 'userFullName', 'userPhone', 'userConnection', 'userEmail', 'status']);
     
    const result: any = {};
    
    Object.keys(geo).forEach((key) => {
        if (!noneFields.has(key) && geo[key as keyof Geolocation] !== undefined) {
            result[key as keyof Geolocation] = geo[key as keyof Geolocation];
        }
    });
    
    return result as GeolocationUpdateDto;
}