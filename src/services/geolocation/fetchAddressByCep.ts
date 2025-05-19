  export const fetchAddressByCep = async (cep: string) => {
    const response = await fetch(
        `https://brasilapi.com.br/api/cep/v2/${cep}`
      );
      if (!response.ok) throw new Error("CEP não encontrado.");
      return await response.json();
  };