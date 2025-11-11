import { StatusEnum } from "@/enums/generic/statusEnum";
import { StatusBadge, StatusBadgeCompact, StatusIndicator } from "./statusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Componente de demonstração para visualizar todos os estados de status
 * Este componente pode ser usado para testes e documentação visual
 */
export function StatusDemo() {
  const statuses = [
    {
      status: StatusEnum.Approved,
      name: "Aprovada",
      description: "Questão foi revisada e aprovada para uso",
    },
    {
      status: StatusEnum.Pending,
      name: "Pendente",
      description: "Questão aguardando revisão",
    },
    {
      status: StatusEnum.Rejected,
      name: "Rejeitada",
      description: "Questão foi rejeitada após revisão",
    },
  ];

  return (
    <div className="space-y-8 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Demonstração de Status Visual</h2>
        <p className="text-muted-foreground mb-6">
          Visualização de todos os componentes de status disponíveis
        </p>
      </div>

      {/* Badge Completo */}
      <Card>
        <CardHeader>
          <CardTitle>Badge de Status Completo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {statuses.map((item) => (
              <div key={item.status} className="flex flex-col items-center gap-2">
                <StatusBadge status={item.status} />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Badge Compacto */}
      <Card>
        <CardHeader>
          <CardTitle>Badge de Status Compacto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {statuses.map((item) => (
              <div key={item.status} className="flex flex-col items-center gap-2">
                <StatusBadgeCompact status={item.status} />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Indicador de Status */}
      <Card>
        <CardHeader>
          <CardTitle>Indicador de Status (Apenas Bolinha)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            {statuses.map((item) => (
              <div key={item.status} className="flex items-center gap-3">
                <StatusIndicator status={item.status} />
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exemplo em Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Exemplo em Cards de Questão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statuses.map((item) => (
              <Card
                key={item.status}
                className="relative overflow-hidden border-2 hover:shadow-lg transition-all"
              >
                <div className="absolute -top-2 -right-2 z-10">
                  <StatusBadge status={item.status} />
                </div>
                <CardHeader className="pt-6">
                  <CardTitle className="text-base">Questão de Exemplo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Esta é uma questão de exemplo com status: <strong>{item.name}</strong>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Status */}
      <Card>
        <CardHeader>
          <CardTitle>Referência Rápida de Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Badge</th>
                  <th className="text-left p-2">Indicador</th>
                  <th className="text-left p-2">Descrição</th>
                </tr>
              </thead>
              <tbody>
                {statuses.map((item) => (
                  <tr key={item.status} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{item.name}</td>
                    <td className="p-2">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="p-2">
                      <StatusIndicator status={item.status} />
                    </td>
                    <td className="p-2 text-sm text-muted-foreground">
                      {item.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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

