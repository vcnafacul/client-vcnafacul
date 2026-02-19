export interface FixDetail {
    field: string;
    issue: string;
    oldValue: any;
    newValue: any;
    detail?: string;
}

export interface ProvaFixEntry {
    provaId: string;
    provaNome: string;
    fixes: FixDetail[];
}

export interface SimuladoFixEntry {
    simuladoId: string;
    simuladoNome: string;
    fixes: FixDetail[];
}

export interface SyncError {
    provaId: string;
    provaNome: string;
    error: string;
}

export type SyncStatus = "idle" | "processing" | "completed" | "error";

export interface SyncReport {
    status: SyncStatus;
    processedAt: string | null;
    totalProvas: number;
    provasFixed: ProvaFixEntry[];
    simuladosFixed: SimuladoFixEntry[];
    errors: SyncError[];
}
