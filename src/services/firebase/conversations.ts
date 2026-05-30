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

export function listenStudentActiveConversation(
  userId: string,
  cb: (conv: ConversationDoc | null) => void,
): Unsubscribe {
  const q = query(
    collection(getFirestoreDb(), "conversations"),
    where("userId", "==", userId),
    where("status", "==", "open"),
    limit(1),
  );
  return onSnapshot(
    q,
    (snap) => {
      if (snap.empty) {
        cb(null);
      } else {
        const d = snap.docs[0];
        cb({ id: d.id, ...(d.data() as Omit<ConversationDoc, "id">) });
      }
    },
    (err) => {
      console.warn("[firestore listener]", err.code ?? err.message);
    },
  );
}

export function listenStudentCooldown(
  userId: string,
  partnerPrepId: string | null,
  cb: (cooldownUntil: number | null) => void,
): Unsubscribe {
  const q = query(
    collection(getFirestoreDb(), "conversations"),
    where("userId", "==", userId),
    where("status", "==", "closed"),
    where("partnerPrepId", "==", partnerPrepId),
    orderBy("closedAt", "desc"),
    limit(1),
  );
  return onSnapshot(
    q,
    (snap) => {
      if (snap.empty) {
        cb(null);
        return;
      }
      const closedAtMs = snap.docs[0].data().closedAt?.toMillis?.() ?? null;
      if (closedAtMs === null) {
        cb(null);
        return;
      }
      const until = closedAtMs + CHAT_COOLDOWN_MS;
      cb(until > Date.now() ? until : null);
    },
    (err) => {
      console.warn("[firestore cooldown listener]", err.code ?? err.message);
    },
  );
}

export function listenArchivedInbox(
  cb: (convs: ConversationDoc[]) => void,
  partnerPrepId?: string | null,
): Unsubscribe {
  const constraints: QueryConstraint[] = [
    where("status", "==", "closed"),
    orderBy("closedAt", "desc"),
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
