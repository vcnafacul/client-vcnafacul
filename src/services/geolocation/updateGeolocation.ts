/* eslint-disable @typescript-eslint/no-explicit-any */
import { GeolocationUpdateDto } from "../../dtos/geolocation/geolocationUpdateDto";
import { Geolocation } from "../../types/geolocation/geolocation";
import fetchWrapper from "../../utils/fetchWrapper";
import { geolocations } from "../urls";

interface UpdateGeolocationProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        const res = await response.json()
        if(response.status === 400) {
            let messageErro = ""
            res.message.map((m: string) => messageErro =  messageErro.concat(m).concat("; "))
            console.log(messageErro)
            throw new Error(messageErro)
        }
        return res
    } catch (error: any) {
        throw new Error(`Error - ${error.message}`)
    }
}

export async function UpdateGeolocationStatus({ body, token}: UpdateGeolocationProps){
    try {
        const response = await fetchWrapper(`${geolocations}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
        });
        return await response.json()
    } catch (error: any) {
        throw new Error(`Erro Interno - Informar a Administracão - ${error.message}`)
    }
    
}

const converteGeolocationUpdateDto = (geo: Geolocation): GeolocationUpdateDto => {
    const noneFields = new Set(['createdAt', 'updatedAt', 'deletedAt', 'userFullName', 'userPhone', 'userConnection', 'userEmail', 'status']);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = {};
    
    Object.keys(geo).forEach((key) => {
        if (!noneFields.has(key) && geo[key as keyof Geolocation] !== undefined) {
            result[key as keyof Geolocation] = geo[key as keyof Geolocation];
        }
    });
    
    return result as GeolocationUpdateDto;
}