declare module "validations-br" {
  export function validateCPF(cpf: string): boolean;
  export function validateCNPJ(cnpj: string): boolean;
  export function validatePhone(phone: string): boolean;
  export function validateEmail(email: string): boolean;
}
