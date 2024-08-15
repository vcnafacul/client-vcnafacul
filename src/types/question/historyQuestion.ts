export interface HistoryQuestion {
  user: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
  history: AuditLogMS[];
}

export interface AuditLogMS {
  user: { id: number; name: string; email: string };
  entityId: string;
  changes: string;
  entityType: string;
  createdAt: string;
}
