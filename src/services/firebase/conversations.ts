import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirestoreDb } from "./client";

export interface ConversationDoc {
  id: string;
  userId: string;
  userName: string;
  status: "open" | "closed";
  lastMessageAt?: { toMillis: () => number };
  unreadCountStudent: number;
  unreadCountSupport: number;
  metadata?: { page: string; device: string; browser: string };
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
  return onSnapshot(q, (snap) => {
    if (snap.empty) {
      cb(null);
    } else {
      const d = snap.docs[0];
      cb({ id: d.id, ...(d.data() as Omit<ConversationDoc, "id">) });
    }
  });
}

export function listenSupportInbox(
  cb: (convs: ConversationDoc[]) => void,
): Unsubscribe {
  const q = query(
    collection(getFirestoreDb(), "conversations"),
    where("status", "==", "open"),
    orderBy("lastMessageAt", "desc"),
    limit(50),
  );
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ConversationDoc, "id">),
      })),
    );
  });
}
