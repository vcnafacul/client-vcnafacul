export function cleanObject<T extends object>(objeto: T): Partial<T> {
    const objetoLimpo: Partial<T> = {};
    for (const chave in objeto) {
        if (objeto[chave] !== null && objeto[chave] !== "" && objeto[chave] !== undefined) {
            objetoLimpo[chave as keyof T] = objeto[chave];
        }
    }
    return objetoLimpo;
}