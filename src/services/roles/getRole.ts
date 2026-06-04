/* eslint-disable @typescript-eslint/no-explicit-any */
import { PermissionGroupResponse } from "@/dtos/roles/permission";
import fetchWrapper from "../../utils/fetchWrapper";
import { role } from "../urls";

export interface Role {
  name: string;
  liberado: boolean;
}

export interface RolesResponse {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  permissoes: Role[];
}

export async function getRole(
  roleId: string,
  token: string,
): Promise<RolesResponse> {
  const response = await fetchWrapper(`${role}/${roleId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status !== 200) {
    throw new Error("Erro ao buscar permissões");
  } else {
    return transformaObjeto(await response.json());
  }
}

export async function getRoleNew(
  id: string,
  token: string,
): Promise<PermissionGroupResponse[]> {
  const response = await fetchWrapper(`${role}/${id}/permissions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 200) {
    return await response.json();
  } else {
    throw new Error("Erro ao buscar permissões do perfil");
  }
}

function transformaObjeto(obj: any): RolesResponse {
  const permissoes: Role[] = [];

  for (const [chave, valor] of Object.entries(obj)) {
    if (
      chave !== "id" &&
      chave !== "name" &&
      chave !== "createdAt" &&
      chave !== "updatedAt" &&
      chave !== "deletedAt"
    ) {
      permissoes.push({ name: chave, liberado: valor as boolean });
    }
  }

  return {
    id: obj.id,
    name: obj.name,
    created_at: obj.createdAt,
    updated_at: obj.updatedAt,
    permissoes: permissoes,
  };
}
