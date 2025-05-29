export interface Collaborator {
  id: string;
  photo: string;
  description: string;
  actived: boolean;
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
    lastAccess: Date;
  };
}
