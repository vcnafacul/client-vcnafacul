// client-vcnafacul/src/pages/homeV2/data/heroData.ts
import { REGISTER_PATH } from "../../../routes/path";

export interface HeroPersona {
  eyebrow: string;
  title: string;
  microcopy?: string;
  ctaLabel: string;
  ctaHref: string;
  ctaTarget?: "_blank" | "_self";
  variant: "primary" | "secondary" | "tertiary";
}

export interface HeroData {
  eyebrow: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  personas: HeroPersona[];
}

export const heroData: HeroData = {
  eyebrow: "PLATAFORMA DE EDUCAÇÃO GRATUITA",
  title: "Nossa missão é ver",
  titleAccent: "VOCÊ NA FACUL",
  subtitle:
    "Plataforma em construção. Cadastre-se para testar ou encontre um cursinho popular perto de você.",
  personas: [
    {
      eyebrow: "SOU ALUNO",
      title: "Pré-cadastro grátis",
      microcopy: "Receba avisos da plataforma e ganhe acesso na abertura.",
      ctaLabel: "Começar →",
      ctaHref: REGISTER_PATH,
      variant: "primary",
    },
    {
      eyebrow: "QUERO AJUDAR",
      title: "Seja voluntário",
      ctaLabel: "Entrar no time →",
      ctaHref:
        "https://docs.google.com/forms/d/e/1FAIpQLSeMw9aY9Qz3BCecidXo8_XaGiFgWiUq1ldJwRnP00e1bW1QHw/viewform",
      ctaTarget: "_blank",
      variant: "secondary",
    },
    {
      eyebrow: "EMPRESA",
      title: "Apoie a causa",
      ctaLabel: "Entrar em contato →",
      ctaHref: "mailto:contato@vcnafacul.com.br",
      variant: "tertiary",
    },
  ],
};
