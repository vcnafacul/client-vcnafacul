import { Auth } from "../../store/auth"

export type UserRegister = Auth & {
    password: string,
    password_confirmation: string,
}

export type User = Auth & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}