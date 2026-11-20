import { Badge } from "@/components/ui/badge";
import { StatusEnum } from "@/enums/generic/statusEnum";
import { 
  CheckCircle2Icon, 
  ClockIcon, 
  XCircleIcon,
  HelpCircleIcon 
} from "lucide-react";

interface StatusBadgeProps {
  status: StatusEnum;
  className?: string;
}

// Configuração visual para cada status
const getStatusConfig = (status: StatusEnum) => {
  switch (status) {
    case StatusEnum.Approved:
      return {
        label: "Aprovada",
        icon: CheckCircle2Icon,
        className: "bg-success text-success-foreground border-0 shadow-lg shadow-success/30",
        pulseColor: "bg-success/60",
        emoji: "✅"
      };
    case StatusEnum.Pending:
      return {
        label: "Pendente",
        icon: ClockIcon,
        className: "bg-warning text-warning-foreground border-0 shadow-lg shadow-warning/30",
        pulseColor: "bg-warning/60",
        emoji: "⏳"
      };
    case StatusEnum.Rejected:
      return {
        label: "Rejeitada",
        icon: XCircleIcon,
        className: "bg-destructive text-destructive-foreground border-0 shadow-lg shadow-destructive/30",
        pulseColor: "bg-destructive/60",
        emoji: "❌"
      };
    default:
      return {
        label: "Desconhecido",
        icon: HelpCircleIcon,
        className: "bg-muted-foreground text-background border-0 shadow-lg shadow-muted-foreground/30",
        pulseColor: "bg-muted-foreground/60",
        emoji: "❓"
      };
  }
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className={`relative inline-flex items-center group ${className}`}>
      {/* Efeito de pulso animado */}
      <span className="flex absolute h-full w-full">
        <span 
          className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.pulseColor} opacity-75`}
        />
      </span>

      {/* Badge principal */}
      <Badge 
        className={`relative flex items-center gap-2 px-3 py-1.5 text-body font-bold
          transition-all duration-300 hover:scale-110 hover:shadow-xl
          ${config.className}`}
      >
        {/* Ícone */}
        <Icon className="h-4 w-4 animate-pulse" />
        
        {/* Emoji decorativo */}
        <span className="text-body leading-none">{config.emoji}</span>
        
        {/* Label */}
        <span className="leading-none">{config.label}</span>
      </Badge>
    </div>
  );
}

// Componente compacto para espaços menores
export function StatusBadgeCompact({ status }: { status: StatusEnum }) {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div 
      className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full
        text-caption font-semibold transition-all duration-300 hover:scale-105
        ${config.className}`}
      title={config.label}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="text-body">{config.emoji}</span>
    </div>
  );
}

// Componente de indicador de status (apenas bolinha colorida)
export function StatusIndicator({ status }: { status: StatusEnum }) {
  const config = getStatusConfig(status);

  return (
    <div 
      className="relative inline-flex items-center"
      title={config.label}
    >
      {/* Pulso de fundo */}
      <span className="flex absolute h-full w-full">
        <span 
          className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.pulseColor} opacity-75`}
        />
      </span>
      
      {/* Círculo principal */}
      <span 
        className={`relative inline-flex rounded-full h-3 w-3 ${config.pulseColor} shadow-lg`}
      />
    </div>
  );
}

