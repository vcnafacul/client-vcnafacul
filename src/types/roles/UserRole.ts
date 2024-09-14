import { User } from "../user/userRegister";

export interface UserRole {
    user: User;
    roleId: string;
    roleName: string;
}