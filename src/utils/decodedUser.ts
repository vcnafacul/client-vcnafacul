import { AuthProps } from "../store/auth";
import { jwtDecoded } from "./jwt";


export function decoderUser(access_token: string){
    const decoded = jwtDecoded(access_token)
    const birthdayRaw = decoded.user.birthday;
    let birthdayFormatted = "";
    if (birthdayRaw) {
        const birthday = new Date(birthdayRaw.replace("Z", ""));
        const monthBirthday = birthday.getMonth() + 1 < 10 ? `0${birthday.getMonth() + 1}` : birthday.getMonth();
        const dayBirthday = birthday.getDate() < 10 ? `0${birthday.getDate()}` : birthday.getDate();
        birthdayFormatted = `${dayBirthday}/${monthBirthday}/${birthday.getFullYear()}`;
    }
    const payload : AuthProps = {
        token: access_token,
        user: {
            ...decoded.user,
            birthday: birthdayFormatted,
            state: decoded.user.state ? decodeURIComponent(decoded.user.state) : "",
            },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        permissao: (decoded.roles || []).reduce((obj: any, item: number) => {
                obj[item] = true;
                return obj;
            }, {}),
        profileComplete: decoded.profileComplete ?? null,
    };
    return payload
}