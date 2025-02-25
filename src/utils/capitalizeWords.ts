import { capitalize } from "./capitalize";

export function capitalizeWords(text: string) {
  return text
      .toLowerCase() // Garante que todo o texto fique em minúsculas
      .split(' ') // Divide o texto em palavras
      .map(word => capitalize(word)) // Capitaliza a primeira letra de cada palavra
      .join(' '); // Junta as palavras de volta em uma string
}