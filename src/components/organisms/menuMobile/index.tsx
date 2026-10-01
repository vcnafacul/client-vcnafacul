import { ArrowUpRight, Bug, ChevronRight, Lightbulb, X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { ReactComponent as LogoIcon } from "../../../assets/images/home/logo.svg";
import { HOME_PATH } from "../../../routes/path";
import { SocialLink } from "../../molecules/followUs";
import { ItemMenuProps } from "../../molecules/menuItems";

const RELATAR_PROBLEMA =
  "https://github.com/orgs/vcnafacul/discussions/new?category=problemas";
const PROPOR_IDEIA =
  "https://github.com/orgs/vcnafacul/discussions/new?category=ideas";

interface MenuMobileProps {
  open: boolean;
  onClose: () => void;
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
 * O menu do celular e do tablet (abaixo de `md`, 1200px): tela cheia, fundo
 * branco, itens grandes com toque fácil, ajuda e redes no rodapé.
 *
 * ⚠️ Vai por portal para o `body`: o header é `fixed` e um ancestral com
 * `transform` faria o `fixed` daqui virar relativo a ele.
 */
export default function MenuMobile({
  open,
  onClose,
  itens,
  redes,
  entrar,
  cadastrar,
  nome,
}: MenuMobileProps) {
  const { pathname, hash } = useLocation();

  // Trava a rolagem da página por trás e fecha no Esc.
  useEffect(() => {
    if (!open) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", aoTeclar);
    return () => {
      document.body.style.overflow = anterior;
      window.removeEventListener("keydown", aoTeclar);
    };
  }, [open, onClose]);

  if (!open) return null;

  const classeItem = (eAtivo: boolean) =>
    `group flex items-center justify-between gap-4 py-4 text-2xl font-bold tracking-tight transition-colors ${
      eAtivo ? "text-orange" : "text-marine hover:text-orange"
    }`;

  const seta = (eAtivo: boolean) => (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
        eAtivo
          ? "bg-orange text-white"
          : "bg-gray-100 text-marine group-hover:bg-orange group-hover:text-white"
      }`}
    >
      <ChevronRight className="h-5 w-5" />
    </span>
  );

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-white animate-in fade-in duration-200 md:hidden print:hidden"
    >
      {/* Mesma altura do header: abrir e fechar não "pula" o logo. */}
      <div className="flex h-[76px] shrink-0 items-center justify-between px-4">
        <Link
          to={HOME_PATH}
          onClick={onClose}
          className="flex items-center gap-2.5 text-lg text-marine"
        >
          <LogoIcon />
          <span>
            você na <strong>facul</strong>
          </span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar menu"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-marine transition-colors hover:bg-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-6 pb-8 pt-4">
        {nome && (
          <p className="mb-2 text-sm font-medium text-gray-500">
            Olá, <span className="text-marine">{nome}</span> 👋
          </p>
        )}

        <nav aria-label="Menu principal">
          <ul className="divide-y divide-gray-100">
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
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
            Ajude a melhorar
          </p>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={RELATAR_PROBLEMA}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex flex-col gap-3 rounded-2xl bg-gray-50 p-4 text-sm font-semibold text-marine transition-colors hover:bg-gray-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-orange shadow-sm">
                <Bug className="h-4 w-4" />
              </span>
              Relatar um problema
            </a>
            <a
              href={PROPOR_IDEIA}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex flex-col gap-3 rounded-2xl bg-gray-50 p-4 text-sm font-semibold text-marine transition-colors hover:bg-gray-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-green2 shadow-sm">
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
                className="flex h-12 items-center justify-center rounded-full border-2 border-marine text-base font-bold text-marine transition-colors hover:bg-marine hover:text-white"
              >
                Entrar
              </Link>
              <Link
                to={cadastrar.Home_Menu_Item_id.link}
                onClick={onClose}
                className="flex h-12 items-center justify-center gap-1 rounded-full bg-orange text-base font-bold text-white transition-opacity hover:opacity-90"
              >
                Cadastrar
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {redes.length > 0 && (
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
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
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200 [&_svg]:h-5 [&_svg]:w-5"
                    >
                      {typeof Icone === "string" ? (
                        <img src={Icone} alt="" className="h-5 w-5" />
                      ) : (
                        <Icone className="fill-marine" />
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
