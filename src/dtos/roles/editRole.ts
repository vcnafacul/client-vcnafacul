import { CreateRoleDto } from "./createRole";

export interface EditRoleDto extends CreateRoleDto {
  id: string;
  /** Coordenador pode indicar este perfil a quem ele exclui do cursinho. */
  isRecommended?: boolean;
}
