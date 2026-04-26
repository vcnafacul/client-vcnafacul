export type NewsContentType = 'file' | 'text';

export interface News {
    id: string;
    title: string;
    description?: string | null;
    fileName: string | null;
    body?: string | null;
    contentType: NewsContentType;
    createdAt: Date;
    actived: boolean;
    destaque: boolean;
    /** Data de expiração (YYYY-MM-DD); null = sem expiração */
    expireAt?: string | null;
}
