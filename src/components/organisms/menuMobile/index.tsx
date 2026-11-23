import { ArrowUpRight, Bug, ChevronRight, Lightbulb } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ReactComponent as LogoIcon } from "../../../assets/images/home/logo.svg";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HOME_PATH } from "../../../routes/path";
import { SocialLink } from "../../molecules/followUs";
import { ItemMenuProps } from "../../molecules/menuItems";

const RELATAR_PROBLEMA =
  "https://github.com/orgs/vcnafacul/discussions/new?category=problemas";
const PROPOR_IDEIA =
  "https://github.com/orgs/vcnafacul/discussions/new?category=ideas";

/** O `md` do tailwind.config (1200px): a partir dele o header mostra o menu inteiro. */
const BREAKPOINT_MD = "(min-width: 1200px)";

interface MenuMobileProps {
  open: boolean;
  onClose: () => void;
  /** Abre o menu (o hambúrguer do header, quando ele é o gatilho). */
  onOpen?: () => void;
  /**
   * O botão que abre o menu. Com ele, o Radix devolve o foco ao botão ao
   * fechar; sem ele o foco se perde.
   */
  gatilho?: ReactNode;
  itens: ItemMenuProps[];
  redes: SocialLink[];
  /** Sem login: entra o par Entrar/Cadastrar no rodapé do menu. */
  entrar?: ItemMenuProps;
  cadastrar?: ItemMenuProps;
  /** Com login: a saudação no topo. */
  nome?: string;
}

/** O item é a página atual? `/#map` só conta na home, com o mesmo hash. */
function ativo(link: string, pathname: string, hash: string) {
  const [caminho, ancora] = link.split("#");
  if (ancora !== undefined) {
    return (caminho || "/") === pathname && hash === `#${ancora}`;
  }
  return link === pathname;
}

/**
 * O menu do celular e do tablet (abaixo de `md`, 1200px): um `Sheet` à
 * esquerda aberto pelo hambúrguer do header (tickets/059 §7.4). O Radix cuida
 * de prender o foco, travar a rolagem, fechar no Esc e devolver o foco ao
 * hambúrguer.
 */
export default function MenuMobile({
  open,
  onClose,
  onOpen,
  gatilho,
  itens,
  redes,
  entrar,
  cadastrar,
  nome,
}: MenuMobileProps) {
  const { pathname, hash } = useLocation();

  // O conteúdo some a partir de `md` (1200px, `md:hidden`), mas o véu e a trava de
  // rolagem do Radix ficariam: ao cruzar o breakpoint com o menu aberto, fecha.
  useEffect(() => {
    if (!open || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(BREAKPOINT_MD);
    if (mq.matches) {
      onClose();
      return;
    }
    const aoMudar = (e: MediaQueryListEvent) => {
      if (e.matches) onClose();
    };
    mq.addEventListener("change", aoMudar);
    return () => mq.removeEventListener("change", aoMudar);
  }, [open, onClose]);

  const classeItem = (eAtivo: boolean) =>
    `group flex items-center justify-between gap-4 py-4 text-h3 font-bold transition-colors ${
      eAtivo ? "text-primary" : "text-foreground hover:text-primary"
    }`;

  const seta = (eAtivo: boolean) => (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
        eAtivo
          ? "bg-cta text-cta-foreground"
          : "bg-muted text-foreground group-hover:bg-cta group-hover:text-cta-foreground"
      }`}
    >
      <ChevronRight className="h-5 w-5" />
    </span>
  );

  return (
    <Sheet
      open={open}
      onOpenChange={(aberto) => (aberto ? onOpen?.() : onClose())}
    >
      {gatilho && <SheetTrigger asChild>{gatilho}</SheetTrigger>}
      <SheetContent
        side="left"
        aria-describedby={undefined}
        className="flex w-[88%] flex-col overflow-y-auto p-0 sm:max-w-sm md:hidden print:hidden"
      >
        <SheetTitle className="sr-only">Menu</SheetTitle>
        {/* Mesma altura do header: abrir e fechar não "pula" o logo. O
            botão de fechar do Sheet fica à direita. */}
        <div className="flex h-[76px] shrink-0 items-center px-4 pr-16">
          <Link
            to={HOME_PATH}
            onClick={onClose}
            className="flex items-center gap-2.5 text-h3 text-foreground"
          >
            <LogoIcon />
            <span>
              você na <strong>facul</strong>
            </span>
          </Link>
        </div>

        <div className="flex flex-1 flex-col px-6 pb-8 pt-4">
          {nome && (
            <p className="mb-2 text-body font-medium text-muted-foreground">
              Olá, <span className="text-foreground">{nome}</span> 👋
            </p>
          )}

          <nav aria-label="Menu principal">
            <ul className="divide-y divide-border">
              {itens.map((item, i) => {
                const { id, name, link, target } = item.Home_Menu_Item_id;
                const eAtivo = ativo(link, pathname, hash);
                return (
                  <li
                    key={id}
                    className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-300"
                    style={{ animationDelay: `${60 + i * 50}ms` }}
                  >
                    {/* Âncora (`/#map`) vai por <a>: o Link não rola até ela. */}
                    {link.includes("#") ? (
                      <a
                        href={link}
                        target={target}
                        onClick={onClose}
                        aria-current={eAtivo ? "page" : undefined}
                        className={classeItem(eAtivo)}
                      >
                        {name}
                        {seta(eAtivo)}
                      </a>
                    ) : (
                      <Link
                        to={link}
                        target={target}
                        onClick={onClose}
                        aria-current={eAtivo ? "page" : undefined}
                        className={classeItem(eAtivo)}
                      >
                        {name}
                        {seta(eAtivo)}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div
            className="mt-8 animate-in fade-in fill-mode-both duration-300"
            style={{ animationDelay: `${120 + itens.length * 50}ms` }}
          >
            <p className="mb-3 text-caption font-semibold uppercase tracking-widest text-muted-foreground">
              Ajude a melhorar
            </p>
            <div className="grid grid-cols-2 gap-3">
              <a
                href={RELATAR_PROBLEMA}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex flex-col gap-3 rounded-xl bg-page p-4 text-body font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                  <Bug className="h-4 w-4" />
                </span>
                Relatar um problema
              </a>
              <a
                href={PROPOR_IDEIA}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex flex-col gap-3 rounded-xl bg-page p-4 text-body font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-success shadow-sm">
                  <Lightbulb className="h-4 w-4" />
                </span>
                Propor uma ideia
              </a>
            </div>
          </div>

          {/* Rodapé encostado embaixo quando sobra tela. */}
          <div
            className="mt-auto space-y-6 pt-10 animate-in fade-in fill-mode-both duration-300"
            style={{ animationDelay: `${180 + itens.length * 50}ms` }}
          >
            {entrar && cadastrar && (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to={entrar.Home_Menu_Item_id.link}
                  onClick={onClose}
                  className="flex h-12 items-center justify-center rounded-full border-2 border-primary text-body font-bold text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  Entrar
                </Link>
                <Link
                  to={cadastrar.Home_Menu_Item_id.link}
                  onClick={onClose}
                  className="flex h-12 items-center justify-center gap-1 rounded-full bg-cta text-body font-bold text-cta-foreground transition-opacity hover:opacity-90"
                >
                  Cadastrar
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            {redes.length > 0 && (
              <div className="flex items-center justify-between gap-4">
                <p className="text-caption font-semibold uppercase tracking-widest text-muted-foreground">
                  Siga a gente
                </p>
                <div className="flex gap-2">
                  {redes.map((rede) => {
                    const Icone = rede.image;
                    return (
                      <a
                        key={rede.Home_Menu_Item_id.id}
                        href={rede.Home_Menu_Item_id.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={rede.Home_Menu_Item_id.name}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted [&_svg]:h-5 [&_svg]:w-5"
                      >
                        {typeof Icone === "string" ? (
                          <img src={Icone} alt="" className="h-5 w-5" />
                        ) : (
                          <Icone className="fill-primary" />
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
