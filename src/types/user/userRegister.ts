import { Auth } from "../../store/auth"

export type UserRegister = Auth & {
    password: string,
    password_confirmation: string,
}