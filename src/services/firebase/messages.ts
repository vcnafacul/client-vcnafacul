import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirestoreDb } from "./client";

export interface MessageDoc {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: "student" | "support";
  content: string;
  createdAt?: { toMillis: () => number };
}

/**
 * Listener de mensagens de uma conversa.
 *
 * Quando `studentUserId` é fornecido, adiciona filtro `conversationUserId == studentUserId`
 * — necessário pra Firestore rules permitirem o list query do estudante (regra checa
 * `conversationUserId`, então query precisa filtrar por isso). Suporte chama sem o filtro
 * (rule libera incondicional via `isSupport()`).
 */
export function listenMessages(
  conversationId: string,
  cb: (msgs: MessageDoc[]) => void,
  studentUserId?: string,
): Unsubscribe {
  const constraints = [
    where("conversationId", "==", conversationId),
    ...(studentUserId
      ? [where("conversationUserId", "==", studentUserId)]
      : []),
    orderBy("createdAt", "asc"),
  ];
  const q = query(collection(getFirestoreDb(), "messages"), ...constraints);
  return onSnapshot(
    q,
    (snap) => {
      cb(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<MessageDoc, "id">),
        })),
      );
    },
    (err) => {
      console.warn("[firestore listener]", err.code ?? err.message);
    },
  );
}
