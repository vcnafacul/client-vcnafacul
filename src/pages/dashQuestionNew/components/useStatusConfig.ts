import { StatusEnum } from "@/enums/generic/statusEnum";

// Hook para usar em outras páginas
export function useStatusConfig() {
  return {
    getStatusLabel: (status: StatusEnum) => {
      switch (status) {
        case StatusEnum.Approved:
          return "Aprovada";
        case StatusEnum.Pending:
          return "Pendente";
        case StatusEnum.Rejected:
          return "Rejeitada";
        default:
          return "Desconhecido";
      }
    },
    getStatusColor: (status: StatusEnum) => {
      switch (status) {
        case StatusEnum.Approved:
          return "green";
        case StatusEnum.Pending:
          return "amber";
        case StatusEnum.Rejected:
          return "red";
        default:
          return "gray";
      }
    },
  };
}
