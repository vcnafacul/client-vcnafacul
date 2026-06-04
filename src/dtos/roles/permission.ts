import { PermissionType } from "./permissionHierarchy";

export interface PermissionNodeResponse {
  key: string;
  label: string;
  type: PermissionType;
  value: boolean;
}

export interface PermissionGroupResponse {
  key: string;
  label: string;
  permissions: PermissionNodeResponse[];
}
