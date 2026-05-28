export enum PermissionType {
  project = "project",
  prepCourse = "prepCourse",
}

export interface PermissionNode {
  key: string; // snake_case value from BE, e.g. 'criar_questao'
  label: string;
  type: PermissionType;
  implies?: string[];
}

export interface PermissionGroup {
  key: string;
  label: string;
  permissions: PermissionNode[];
}
