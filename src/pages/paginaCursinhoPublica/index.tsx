import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BookOpen, ClipboardList, GraduationCap, Users } from "lucide-react";
import {
  FaFacebook,
  FaGlobe,
  FaInstagram,
  FaLinkedin,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { FiExternalLink, FiLock, FiMapPin } from "react-icons/fi";
import BaseTemplate from "@/components/templates/baseTemplate";
import RichTextRenderer from "@/components/atoms/richTextRenderer/RichTextRenderer";
import { ImpactCard } from "@/components/molecules/impactCard";
import { Section } from "@/components/templates/homeSection/Section";
import { VolunteersSection } from "@/pages/homeV2/sections/VolunteersSection";
import {
  getLinksInternos,
  getPaginaPublica,
  LinkDaPagina,
  PaginaPublica,
  RedeSocial,
} from "@/services/paginaCursinho";
import { useAuthStore } from "@/store/auth";

const REDES: Record<RedeSocial, { nome: string; Icone: React.ElementType }> = {
  site: { nome: "Site", Icone: FaGlobe },
  instagram: { nome: "Instagram", Icone: FaInstagram },
  facebook: { nome: "Facebook", Icone: FaFacebook },
  linkedin: { nome: "LinkedIn", Icone: FaLinkedin },
  youtube: { nome: "YouTube", Icone: FaYoutube },
  twitter: { nome: "X (Twitter)", Icone: FaXTwitter },
  tiktok: { nome: "TikTok", Icone: FaTiktok },
};

/** Link de rede social cadastrado sem protocolo (`instagram.com/x`) ganha `https://`. */
const comProtocolo = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

function ListaDeLinksPublica({
  titulo,
  links,
  icone,
}: {
  titulo: string;
  links: LinkDaPagina[];
  icone?: React.ReactNode;
}) {
  return (
    <section aria-label={titulo} className="max-w-5xl mx-auto px-6 py-10">
      <h2 className="flex items-center gap-2 text-h1 font-extrabold text-foreground mb-4">
        {icone}
        {titulo}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {links.map((l) => (
          <li key={`${l.titulo}-${l.url}`}>
            <a
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 bg-white border rounded-xl px-4 py-3 text-foreground hover:border-primary transition-colors"
            >
              <span className="font-semibold break-words min-w-0">{l.titulo}</span>
              <FiExternalLink className="shrink-0" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Página pública `/cursinho/:slug` (tickets/025, card 07). */
export default function PaginaCursinhoPublica() {
  const { slug = "" } = useParams();
  const token = useAuthStore((s) => s.data.token);
  const [pagina, setPagina] = useState<PaginaPublica | null | undefined>(undefined);
  const [internos, setInternos] = useState<LinkDaPagina[] | null>(null);

  useEffect(() => {
    setPagina(undefined);
    getPaginaPublica(slug)
      .then(setPagina)
      .catch(() => setPagina(null));
  }, [slug]);

  // Links internos: só pergunta se há alguém logado; 403 → a seção não aparece.
  useEffect(() => {
    setInternos(null);
    if (!token || !pagina) return;
    getLinksInternos(slug, token)
      .then(setInternos)
      .catch(() => setInternos(null));
  }, [slug, token, pagina]);

  if (pagina === undefined) {
    return (
      <BaseTemplate solid position="relative">
        <div className="p-16 text-center text-foreground">Carregando...</div>
      </BaseTemplate>
    );
  }

  if (pagina === null) {
    return (
      <BaseTemplate solid position="relative">
        <div className="max-w-xl mx-auto px-6 py-24 text-center">
          <h1 className="text-h1 font-extrabold text-foreground mb-3">
            Página não encontrada
          </h1>
          <p className="text-muted-foreground">
            Este endereço não existe ou a página do cursinho não está ativa.
          </p>
        </div>
      </BaseTemplate>
    );
  }

  const { impacto } = pagina;
  const cardsDeImpacto = [
    { icon: <GraduationCap size={24} />, value: impacto.estudantesAtendidos, label: "Estudantes atendidos" },
    { icon: <Users size={24} />, value: impacto.estudantesAtivos, label: "Estudantes ativos" },
    { icon: <BookOpen size={24} />, value: impacto.questoesAprovadas, label: "Questões revisadas e aprovadas" },
    { icon: <ClipboardList size={24} />, value: impacto.processosSeletivos, label: "Processos seletivos" },
  ];

  return (
    <BaseTemplate solid position="relative">
      <header className="bg-white">
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-6">
          <h1 className="text-h1 font-extrabold text-foreground leading-tight break-words">
            {pagina.nome}
          </h1>
          {pagina.localizacao && (
            <p className="flex items-center gap-1 text-muted-foreground mt-2">
              <FiMapPin aria-hidden /> {pagina.localizacao}
            </p>
          )}
          {/* Redes sociais: parte do cabeçalho, sem título, ícones pequenos. */}
          {pagina.redes.length > 0 && (
            <ul aria-label="Redes sociais" className="flex flex-wrap gap-2 mt-4">
              {pagina.redes.map(({ rede, url }) => {
                const { nome, Icone } = REDES[rede];
                return (
                  <li key={rede}>
                    <a
                      href={comProtocolo(url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={nome}
                      title={nome}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Icone size={15} aria-hidden />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </header>

      <section aria-label="Quem somos" className="bg-white">
        <div className="max-w-5xl mx-auto px-6 pb-12">
          <h2 className="text-h1 font-extrabold text-foreground mb-3">Quem somos</h2>
          <div className="prose max-w-none">
            <RichTextRenderer
              content={pagina.quemSomos}
              contentFormat="markdown"
              className="text-foreground text-prose"
            />
          </div>
        </div>
      </section>

      {pagina.colaboradores.length > 0 && (
        <Section id="colaboradores" theme="neutral">
          <VolunteersSection
            id="colaboradores"
            eyebrow="QUEM FAZ ACONTECER"
            title="Nossa equipe"
            data={pagina.colaboradores.map((c, i) => ({
              id: i,
              name: c.name,
              role: c.description ?? "",
              imageKey: c.image || null,
            }))}
          />
        </Section>
      )}

      <section aria-label="Impacto" className="bg-page py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-h1 font-extrabold text-foreground text-center mb-8">
            Nosso impacto
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {cardsDeImpacto.map((c) => (
              <ImpactCard key={c.label} {...c} />
            ))}
          </div>
        </div>
      </section>

      {pagina.linksPublicos.length > 0 && (
        <ListaDeLinksPublica titulo="Links úteis" links={pagina.linksPublicos} />
      )}

      {internos && internos.length > 0 && (
        <ListaDeLinksPublica
          titulo="Links internos"
          links={internos}
          icone={<FiLock aria-hidden className="text-h2" />}
        />
      )}

    </BaseTemplate>
  );
}
