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
    firstName: string;
    lastName: string;
    socialName: string;
    email: string;
    phone: string;
    role: {
      id: string;
      name: string;
    };
  };
}
