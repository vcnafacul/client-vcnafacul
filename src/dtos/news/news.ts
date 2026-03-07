export interface News {
    id: string;
    session: string;
    title: string;
    fileName: string;
    createdAt: Date;
    actived: boolean;
    /** Data de expiração (YYYY-MM-DD); null = sem expiração */
    expireAt?: string | null;
}