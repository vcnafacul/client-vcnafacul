import type { PushStatus } from "@/services/push/push";

/** Título e texto de cada estado do push em Minha conta (FE-04). */
type Conteudo = { titulo: string; texto: string };

export const TEXTOS: Record<
  Exclude<PushStatus, "disabled-by-flag">,
  Conteudo
> = {
  active: {
    titulo: "Notificações ativadas neste aparelho",
    texto: "Você recebe os avisos do Você na Facul mesmo com o site fechado.",
  },
  default: {
    titulo: "Receba avisos mesmo com o site fechado",
    texto:
      "Ative para receber avisos importantes do Você na Facul neste aparelho.",
  },
  denied: {
    titulo: "Notificações desativadas neste aparelho",
    texto: "Para receber os avisos, permita as notificações nas configurações:",
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

export type OndeConfigurar =
  "iphone" | "android-app" | "android" | "computador";

/**
 * Onde ficam as notificações nas configurações. ⚠️ O site não consegue abrir
 * essa tela (nem no Android nem no iPhone) — por isso o passo a passo.
 */
export const CAMINHO_DAS_CONFIGURACOES: Record<OndeConfigurar, string> = {
  iphone: "Ajustes → Notificações → Você na Facul",
  "android-app":
    "Configurações do celular → Apps → Você na Facul → Notificações",
  android: "toque no ícone à esquerda do endereço → Permissões → Notificações",
  computador: "clique no ícone à esquerda do endereço → Notificações",
};
