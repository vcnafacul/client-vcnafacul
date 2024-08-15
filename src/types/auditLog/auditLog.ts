export interface AuditLog {
  user: {
    id: string;
    name: string;
    email: string;
  };
  entityId: string;
  changes: string;
  entityType: string;
  createdAt: string;
}