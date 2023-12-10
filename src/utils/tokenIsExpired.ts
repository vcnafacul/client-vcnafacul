import { jwtDecoded } from "./jwt";


export function tokenIsExpired(access_token: string){
    const decoded = jwtDecoded(access_token.replace('Bearer ', ''))
    return decoded.exp * 1000 > Date.now()
}