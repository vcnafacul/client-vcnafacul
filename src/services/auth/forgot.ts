import { forgot } from "../urls";

export const Forgot = async (email: string) => {
    const data = { email };
    
    const response = await fetch(forgot, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (response.status === 400) {
        throw new Error("Esse e-mail não foi cadastrado em nossa plataforma!");
    } else if (response.status === 500) {
      throw new Error("Erro interno no servidor!");
    }
};
