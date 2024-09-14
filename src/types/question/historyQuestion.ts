export interface HistoryQuestion {
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  history: AuditLogMS[];
}

export interface AuditLogMS {
  user: { id: string; name: string; email: string };
  entityId: string;
  changes: string;
  entityType: string;
  createdAt: string;
}
