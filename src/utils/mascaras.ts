// Máscaras dos dados sensíveis, iguais às da api (api-vcnafacul/src/utils/mask*.ts).
// Valor vazio fica vazio, e valor que já veio mascarado da api (com "*") não muda.

const jaMascarado = (valor?: string | null) => !valor || valor.includes("*");

export function mascararCpf(cpf?: string | null): string {
  if (jaMascarado(cpf)) return cpf ?? "";
  // A api só mascara CPF com pontos; aqui vale também o salvo só com dígitos.
  const digitos = cpf!.replace(/\D/g, "");
  if (digitos.length === 11) {
    return `***.***.${digitos.slice(6, 9)}-${digitos.slice(9)}`;
  }
  return cpf!.replace(/^(\d{3})\.(\d{3})/, "***.***");
}

export function mascararRg(rg?: string | null): string {
  if (jaMascarado(rg)) return rg ?? "";
  const digitos = rg!.replace(/\D/g, "");
  if (digitos.length < 9) return "***.***.***-*";
  return `***.***.${digitos.slice(6, 8)}-${digitos.slice(8, 9)}`;
}

export function mascararEmail(email?: string | null): string {
  if (jaMascarado(email)) return email ?? "";
  const [usuario, dominio] = email!.toLocaleLowerCase().split("@");
  if (!usuario || !dominio) return "***@***";
  if (usuario.length <= 2) return `${usuario[0]}*@${dominio}`;
  return `${usuario[0]}${"*".repeat(usuario.length - 2)}${
    usuario[usuario.length - 1]
  }@${dominio}`;
}

export function mascararTelefone(telefone?: string | null): string {
  if (jaMascarado(telefone)) return telefone ?? "";
  const digitos = telefone!.replace(/\D/g, "");
  if (digitos.length < 10) return "(**) *****-****";
  return `(${digitos.slice(0, 2)}) *****-${digitos.slice(-4)}`;
}
