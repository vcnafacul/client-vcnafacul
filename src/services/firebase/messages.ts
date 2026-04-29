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

export function listenMessages(
  conversationId: string,
  cb: (msgs: MessageDoc[]) => void,
): Unsubscribe {
  const q = query(
    collection(getFirestoreDb(), "messages"),
    where("conversationId", "==", conversationId),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<MessageDoc, "id">),
      })),
    );
  });
}
