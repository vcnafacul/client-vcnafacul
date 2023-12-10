/* eslint-disable @typescript-eslint/no-explicit-any */
export function mergeObjects(newObj: any, oldObj: any): any {
    // Definindo a assinatura de índice para o objeto mergedObj
    const mergedObj: { [key: string]: any } = {};

    for (const key in oldObj) {
        // Se a chave existe no newObj e não é undefined, use-a, senão use a do oldObj
        mergedObj[key] = (Object.prototype.hasOwnProperty.call(newObj, key) && newObj[key] !== undefined) ? newObj[key] : oldObj[key];
    }

    return mergedObj;
}
