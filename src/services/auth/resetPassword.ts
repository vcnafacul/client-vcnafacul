import { reset } from "../urls";

export const ResetPassword = async (password: string, token: string) => {
    const data = { password };

    const response = await fetch(reset, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });

    if (response.status === 400) {
        throw new Error("Não foi possível alterar a senha, tente novamente");
    } else if (response.status === 500) {
      throw new Error("Erro interno no servidor!");
    }
};
