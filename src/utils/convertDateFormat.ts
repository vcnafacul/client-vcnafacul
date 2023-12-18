export const convertDateFormat = (dateStr: string) : string  => {
    // Divide a string da data em partes (dia, mês, ano)
    const parts = dateStr.split("/");

    // Reorganiza as partes para o formato yyyy-MM-dd
    // Lembre-se: os meses em JavaScript vão de 0 a 11, então subtraímos 1 do mês.
    const convertedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

    return convertedDate;
}
