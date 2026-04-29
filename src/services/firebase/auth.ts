import { signInWithCustomToken, signOut, type User } from "firebase/auth";
import { getFirebaseAuth } from "./client";

export async function signInFirebase(customToken: string): Promise<User> {
  const auth = getFirebaseAuth();
  const cred = await signInWithCustomToken(auth, customToken);
  return cred.user;
}

export async function signOutFirebase(): Promise<void> {
  await signOut(getFirebaseAuth());
}
