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
        className: "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg shadow-green-500/30",
        pulseColor: "bg-green-400",
        emoji: "✅"
      };
    case StatusEnum.Pending:
      return {
        label: "Pendente",
        icon: ClockIcon,
        className: "bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-0 shadow-lg shadow-amber-500/30",
        pulseColor: "bg-amber-400",
        emoji: "⏳"
      };
    case StatusEnum.Rejected:
      return {
        label: "Rejeitada",
        icon: XCircleIcon,
        className: "bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 shadow-lg shadow-red-500/30",
        pulseColor: "bg-red-400",
        emoji: "❌"
      };
    default:
      return {
        label: "Desconhecido",
        icon: HelpCircleIcon,
        className: "bg-gradient-to-r from-gray-500 to-slate-600 text-white border-0 shadow-lg shadow-gray-500/30",
        pulseColor: "bg-gray-400",
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
        className={`relative flex items-center gap-2 px-3 py-1.5 text-sm font-bold
          transition-all duration-300 hover:scale-110 hover:shadow-xl
          ${config.className}`}
      >
        {/* Ícone */}
        <Icon className="h-4 w-4 animate-pulse" />
        
        {/* Emoji decorativo */}
        <span className="text-base leading-none">{config.emoji}</span>
        
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
        text-xs font-semibold transition-all duration-300 hover:scale-105
        ${config.className}`}
      title={config.label}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="text-sm">{config.emoji}</span>
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

