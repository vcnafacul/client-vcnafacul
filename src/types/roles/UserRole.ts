import { User } from "../user/userRegister";

export interface UserRole {
    user: User;
    roleId: string;
    roleName: string;
    /** Só com o filtro de cursinho (card 06 de `tela-de-usuarios`). */
    colaborador?: { ativo: boolean };
}