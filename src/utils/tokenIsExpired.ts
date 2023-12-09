import { jwtDecoded } from "./jwt";


export function tokenIsExpired(access_token: string){
    const decoded = jwtDecoded(access_token.replace('Bearer ', ''))
    console.log(decoded.exp * 1000 - Date.now())
    return decoded.exp * 1000 > Date.now()
}