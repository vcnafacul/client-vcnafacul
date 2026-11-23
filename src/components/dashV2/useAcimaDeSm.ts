/**
 * ⚠️ O hook mora em `@/hooks/use-above-sm`, que o `components/ui` também usa:
 * dois hooks iguais é como a tabela e a toolbar começariam a discordar sobre o
 * que é "mobile". Os nomes daqui ficam até a limpeza (Task 13, tickets/059).
 */
export { SM_QUERY as SM, useAboveSm as useAcimaDeSm } from "@/hooks/use-above-sm";
