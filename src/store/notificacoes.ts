import {
  listarNotificacoes,
  marcarNotificacaoLida,
  marcarTodasLidas,
  type NotificacaoDaCentral,
} from "@/services/notificacoes";
import { create } from "zustand";

/**
 * Central de notificações (série `central-notificacoes`, cards 03/04).
 *
 * ⚠️ **Store, e não estado do componente**: o `PushSync` (card 04) recarrega
 * a lista de fora do sino — quando chega push com o app aberto ou quando a
 * pessoa volta para o app.
 *
 * ⚠️ Nada em `localStorage`: a fonte da verdade é a api (o `main.tsx` limpa o
 * `localStorage` a cada deploy).
 */
/** Ao voltar para o app, no máximo uma recarga a cada 30s. */
export const INTERVALO_MINIMO_MS = 30_000;

type EstadoDaCentral = {
  itens: NotificacaoDaCentral[];
  naoLidas: number;
  carregada: boolean;
  ultimaCarga: number;
  carregar: (token: string) => Promise<void>;
  /** Como `carregar`, mas pula se carregou há menos de 30s. */
  carregarSeVelha: (token: string) => Promise<void>;
  marcarLida: (id: string, token: string) => Promise<void>;
  marcarTodas: (token: string) => Promise<void>;
  limpar: () => void;
};

const VAZIA = { itens: [], naoLidas: 0, carregada: false, ultimaCarga: 0 };

export const useCentralStore = create<EstadoDaCentral>((set, get) => ({
  ...VAZIA,

  carregar: async (token) => {
    set({ ultimaCarga: Date.now() });
    const { data, naoLidas } = await listarNotificacoes(token);
    set({ itens: data, naoLidas, carregada: true });
  },

  carregarSeVelha: async (token) => {
    if (Date.now() - get().ultimaCarga < INTERVALO_MINIMO_MS) return;
    await get().carregar(token);
  },

  // Otimista: o sino responde na hora; se a api falhar, recarrega a verdade.
  marcarLida: async (id, token) => {
    const alvo = get().itens.find((n) => n.id === id);
    if (!alvo || alvo.lidaEm) return;
    const agora = new Date().toISOString();
    set((s) => ({
      itens: s.itens.map((n) => (n.id === id ? { ...n, lidaEm: agora } : n)),
      naoLidas: Math.max(0, s.naoLidas - 1),
    }));
    try {
      await marcarNotificacaoLida(id, token);
    } catch {
      await get()
        .carregar(token)
        .catch(() => undefined);
    }
  },

  marcarTodas: async (token) => {
    const agora = new Date().toISOString();
    set((s) => ({
      itens: s.itens.map((n) => (n.lidaEm ? n : { ...n, lidaEm: agora })),
      naoLidas: 0,
    }));
    try {
      await marcarTodasLidas(token);
    } catch {
      await get()
        .carregar(token)
        .catch(() => undefined);
    }
  },

  limpar: () => set(VAZIA),
}));
