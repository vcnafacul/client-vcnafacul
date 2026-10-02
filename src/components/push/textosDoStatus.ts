import type { PushStatus } from "@/services/push/push";
import { ambienteAtual, plataforma } from "@/services/push/plataforma";

/** Título e texto de cada estado do push em Minha conta (FE-04). */
type Conteudo = { titulo: string; texto: string };

export const TEXTOS: Record<
  Exclude<PushStatus, "disabled-by-flag">,
  Conteudo
> = {
  // ⚠️ `active` sem dizer "ativadas": a página não sabe com certeza se o
  // aparelho entrega (ver `NasConfiguracoes`).
  active: {
    titulo: "Notificações neste aparelho",
    texto:
      "Com as notificações permitidas, os avisos do Você na Facul chegam mesmo com o site fechado.",
  },
  default: {
    titulo: "Receba avisos mesmo com o site fechado",
    texto:
      "Ative para receber avisos importantes do Você na Facul neste aparelho.",
  },
  // `denied` é o único estado em que a página SABE: o navegador diz que está
  // bloqueado, e não deixa o site perguntar de novo. Então diz com todas as
  // letras e ensina onde liberar.
  denied: {
    titulo: "Notificações bloqueadas neste aparelho",
    texto:
      "As notificações do Você na Facul estão bloqueadas, e o navegador não deixa o site perguntar de novo. Para voltar a receber os avisos, libere nas configurações.",
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
  | "iphone"
  | "android-app"
  | "android"
  | "computador-app"
  | "computador";

/**
 * Onde ficam as notificações nas configurações. ⚠️ O site não consegue abrir
 * essa tela (nem no Android nem no iPhone) — por isso o passo a passo.
 */
export const CAMINHO_DAS_CONFIGURACOES: Record<OndeConfigurar, string> = {
  iphone: "Ajustes → Notificações → Você na Facul",
  "android-app":
    "Configurações do celular → Apps → Você na Facul → Notificações",
  android: "toque no ícone à esquerda do endereço → Permissões → Notificações",
  // A janela do app instalado não tem barra de endereço: o caminho é o menu ⋮
  // da própria janela.
  "computador-app":
    "no menu ⋮ da janela do app → Informações do app → Configurações do site → Notificações",
  computador: "clique no ícone à esquerda do endereço → Notificações",
};

/** Qual caminho mostrar, pelo aparelho e por estar no app instalado ou no navegador. */
export function ondeConfigurar(): OndeConfigurar {
  const ambiente = ambienteAtual();
  const p = plataforma(ambiente);
  if (p === "ios") return "iphone";
  if (p === "android") return ambiente.standalone ? "android-app" : "android";
  return ambiente.standalone ? "computador-app" : "computador";
}
