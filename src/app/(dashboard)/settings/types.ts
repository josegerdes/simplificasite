export interface RolePublic {
  id: string;
  name: string;
  color: string;
  position: number;
  permissions: string[];
  isDefault: boolean;
}

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  color: string;
  roleIds: string[];
  active: boolean;
  createdAt: string;
}
