import { CreateRoleDto } from "./createRole";

export interface EditRoleDto extends CreateRoleDto {
  id: string;
}
