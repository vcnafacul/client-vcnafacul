import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export enum Gender {
  Male,
  Female,
  Other,
}

const initialUser = {
  user: {
    firstName: "",
    lastName: "",
    email: "",
    gender: Gender.Other,
    birthday: "",
    phone: "",
    state: "",
    city: "",
    lgpd: false,
    about: "",
    collaborator: false,
    collaboratorDescription: null,
    collaboratorPhoto: undefined,
  },
  token: "",
  permissao: {},
};

export type AuthUpdate = {
  firstName: string;
  lastName: string;
  socialName?: string;
  gender: Gender;
  birthday: string;
  phone: string;
  state: string;
  city: string;
  about?: string;
};

export type Auth = AuthUpdate & {
  email: string;
  lgpd: boolean;
  collaborator: boolean;
  collaboratorDescription?: string | null;
  collaboratorPhoto?: string | null;
};

export type AuthProps = {
  user: Auth;
  token: string;
  permissao: Record<string, boolean>;
};

type AuthState = {
  data: AuthProps;
  doAuth: (auth: AuthProps) => void;
  logout: () => void;
  updateAccount: (auth: Auth) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      data: initialUser,
      doAuth: (auth: AuthProps) => set({ data: auth }),
      logout: () => {
        set({
          data: { user: { ...initialUser.user }, token: "", permissao: {} },
        });
      },
      updateAccount: (auth: Auth) =>
        set((s) => ({ data: { ...s.data, user: auth } })),
    }),
    {
      name: "auth-storage", // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
