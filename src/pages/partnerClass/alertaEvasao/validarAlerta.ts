/** Inteiro dentro da faixa, ou a mensagem do erro. Vazio só vale para o %. */
export function validarAlerta(percentual: string, minimo: string) {
  const erros: { percentual?: string; minimo?: string } = {};
  if (percentual.trim() !== "") {
    const p = Number(percentual);
    if (!Number.isInteger(p) || p < 1 || p > 100)
      erros.percentual = "Use um número inteiro de 1 a 100.";
  }
  const m = Number(minimo);
  if (minimo.trim() === "" || !Number.isInteger(m) || m < 1 || m > 200)
    erros.minimo = "Use um número inteiro de 1 a 200.";
  return erros;
}
