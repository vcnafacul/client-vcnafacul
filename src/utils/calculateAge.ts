export function calculeAge(dataNascimento: Date): number {
  const hoje = new Date();
  const anoNascimento = dataNascimento.getFullYear();
  const mesNascimento = dataNascimento.getMonth();
  const diaNascimento = dataNascimento.getDate();

  let idade = hoje.getFullYear() - anoNascimento;

  // Ajusta a idade caso a pessoa ainda não tenha feito aniversário neste ano
  if (
    hoje.getMonth() < mesNascimento ||
    (hoje.getMonth() === mesNascimento && hoje.getDate() < diaNascimento)
  ) {
    idade--;
  }

  return idade;
}
