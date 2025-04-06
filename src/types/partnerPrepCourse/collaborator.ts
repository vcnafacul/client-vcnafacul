export interface Collaborator {
  id: string;
  photo: string;
  description: string;
  actived: boolean;
  lastAccess: Date;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: {
      id: string;
      name: string;
    };
  };
}
