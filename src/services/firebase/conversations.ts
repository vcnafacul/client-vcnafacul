import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  type Unsubscribe,
  type QueryConstraint,
} from "firebase/firestore";
import { getFirestoreDb } from "./client";

export const CHAT_COOLDOWN_MS = 15 * 60 * 1000;

export interface ConversationDoc {
  id: string;
  userId: string;
  userName: string;
  status: "open" | "closed";
  initiatedBy?: "student" | "support";
  lastMessageAt?: { toMillis: () => number };
  lastMessageText?: string;
  lastMessageSenderType?: "student" | "support";
  unreadCountStudent: number;
  unreadCountSupport: number;
  metadata?: { page: string; device: string; browser: string };
  partnerPrepId?: string | null;
  cursinhoName?: string | null;
  originLabel?: string | null;
  closedAt?: { toMillis: () => number } | null;
}

/** Quantas conversas do estudante a lista acompanha (abertas + recentes). */
export const LIMITE_CONVERSAS_DO_ESTUDANTE = 30;

const paraDoc = (d: { id: string; data: () => unknown }): ConversationDoc => ({
  id: d.id,
  ...(d.data() as Omit<ConversationDoc, "id">),
});

/**
 * Todas as conversas recentes do estudante (tickets/031, card 03): ele pode
 * ter uma aberta por destino. Quem filtra e ordena para a tela é
 * `conversasVisiveis`.
 *
 * ⚠️ Usa o índice `userId, lastMessageAt desc` (api `firestore.indexes.json`).
 * Sem o índice publicado, o Firestore recusa a consulta
 * (`failed-precondition`) — aí cai na consulta antiga, só das abertas e sem
 * ordem, para o estudante não ficar sem chat.
 */
export function listenStudentConversations(
  userId: string,
  cb: (convs: ConversationDoc[]) => void,
): Unsubscribe {
  const db = getFirestoreDb();
  let parar: Unsubscribe = () => undefined;
  let encerrado = false;

  const soAbertas = () =>
    onSnapshot(
      query(
        collection(db, "conversations"),
        where("userId", "==", userId),
        where("status", "==", "open"),
      ),
      (snap) => cb(snap.docs.map(paraDoc)),
      (err) => console.warn("[firestore listener]", err.code ?? err.message),
    );

  parar = onSnapshot(
    query(
      collection(db, "conversations"),
      where("userId", "==", userId),
      orderBy("lastMessageAt", "desc"),
      limit(LIMITE_CONVERSAS_DO_ESTUDANTE),
    ),
    (snap) => cb(snap.docs.map(paraDoc)),
    (err) => {
      console.warn("[firestore listener]", err.code ?? err.message);
      if (err.code === "failed-precondition" && !encerrado) parar = soAbertas();
    },
  );

  return () => {
    encerrado = true;
    parar();
  };
}

export function listenArchivedInbox(
  cb: (convs: ConversationDoc[]) => void,
  partnerPrepId?: string | null,
): Unsubscribe {
  const constraints: QueryConstraint[] = [
    where("status", "==", "closed"),
    orderBy("lastMessageAt", "desc"),
    limit(50),
  ];

  if (partnerPrepId) {
    constraints.push(where("partnerPrepId", "==", partnerPrepId));
  }

  const q = query(collection(getFirestoreDb(), "conversations"), ...constraints);
  return onSnapshot(
    q,
    (snap) => {
      cb(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ConversationDoc, "id">),
        })),
      );
    },
    (err) => {
      console.warn("[firestore archived listener]", err.code ?? err.message);
    },
  );
}

export function listenSupportInbox(
  cb: (convs: ConversationDoc[]) => void,
  partnerPrepId?: string | null,
): Unsubscribe {
  const constraints: QueryConstraint[] = [
    where("status", "==", "open"),
    orderBy("lastMessageAt", "desc"),
    limit(50),
  ];

  if (partnerPrepId) {
    constraints.push(where("partnerPrepId", "==", partnerPrepId));
  }

  const q = query(collection(getFirestoreDb(), "conversations"), ...constraints);
  return onSnapshot(
    q,
    (snap) => {
      cb(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ConversationDoc, "id">),
        })),
      );
    },
    (err) => {
      console.warn("[firestore listener]", err.code ?? err.message);
    },
  );
}
