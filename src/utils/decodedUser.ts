import { AuthProps } from "../store/auth";
import { jwtDecoded } from "./jwt";


export function decoderUser(access_token: string){
    const decoded = jwtDecoded(access_token)
    const birthday = new Date(decoded.user.birthday.replace("Z", ""));
    const monthBirthday = birthday.getMonth() + 1 < 10 ? `0${birthday.getMonth() + 1}` : birthday.getMonth();
    const dayBirthday = birthday.getDate() < 10 ? `0${birthday.getDate()}` : birthday.getDate();
    const payload : AuthProps = {
        token: access_token,
        user: { 
            ...decoded.user, 
            birthday: `${dayBirthday}/${monthBirthday}/${birthday.getFullYear()}`,
            state: decodeURIComponent(decoded.user.state)
            },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        permissao: decoded.roles.reduce((obj: any, item: number) => {
                obj[item] = true;
                return obj;
            }, {})
    };
    return payload
}