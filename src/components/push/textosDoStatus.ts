import type { PushStatus } from "@/services/push/push";

/** Título e texto de cada estado do push em Minha conta (FE-04). */
type Conteudo = { titulo: string; texto: string };

export const TEXTOS: Record<
  Exclude<PushStatus, "disabled-by-flag">,
  Conteudo
> = {
  active: {
    titulo: "Notificações ativas neste aparelho",
    texto: "Você recebe os avisos do Você na Facul mesmo com o site fechado.",
  },
  default: {
    titulo: "Receba avisos mesmo com o site fechado",
    texto:
      "Ative para receber avisos importantes do Você na Facul neste aparelho.",
  },
  "granted-not-registered": {
    titulo: "Notificações desativadas neste aparelho",
    texto: "Ative de novo quando quiser voltar a receber os avisos.",
  },
  denied: {
    titulo: "Você bloqueou as notificações",
    texto:
      "Para receber os avisos, desbloqueie nas configurações do navegador:",
  },
  "ios-needs-install": {
    titulo: "No iPhone, primeiro adicione o site à Tela de Início",
    texto: "O iPhone só entrega notificações de sites instalados:",
  },
  "ios-too-old": {
    titulo: "Seu iPhone precisa do iOS 16.4 ou mais novo",
    texto:
      "Atualize o iOS em Ajustes → Geral → Atualização de Software para receber notificações.",
  },
  unsupported: {
    titulo: "Este navegador não suporta notificações",
    texto: "Tente pelo Chrome, pelo Edge ou pelo Firefox.",
  },
};
