import { useEffect, useState } from "react";
import BaseTemplate from "../../components/templates/baseTemplate";
import Text from "../../components/atoms/text";
import RichTextRenderer from "../../components/atoms/richTextRenderer/RichTextRenderer";
import { AboutVideoCard } from "../homeV2/sections/AboutSection/AboutVideoCard";
import { Section } from "../../components/templates/homeSection/Section";
import { VolunteersSection } from "../homeV2/sections/VolunteersSection";
import { PartnersTabs } from "./PartnersTabs";
import { NossosValores } from "./NossosValores";
import {
  Volunteer,
  volunteersFallback,
  fetchVolunteers,
} from "../homeV2/adapters/volunteersAdapter";
import {
  PrepCourse,
  prepCoursesFallback,
  fetchPrepCourses,
} from "../homeV2/adapters/prepCoursesAdapter";
import {
  Sponsor,
  sponsorsFallback,
  fetchSponsors,
} from "../homeV2/adapters/sponsorsAdapter";
import {
  AboutSectionData,
  aboutFallback,
  fetchAboutSectionData,
} from "../homeV2/adapters/aboutAdapter";

const HISTORIA_TEXT = `O Você na Facul nasceu da vontade de um grupo de voluntários de tornar o acesso ao ensino superior mais justo e igualitário. Desde o início, a plataforma conecta estudantes a cursinhos populares, materiais de estudo e simulados — tudo de forma gratuita.

Ao longo dos anos, crescemos em tecnologia e em impacto, sempre guiados pela crença de que a educação é a maior ponte entre o sonho e a realização.`;

export default function QuemSomosPage() {
  const [data, setData] = useState<AboutSectionData>(aboutFallback);
  const [volunteers, setVolunteers] = useState<Volunteer[]>(volunteersFallback);
  const [prepCourses, setPrepCourses] = useState<PrepCourse[]>(prepCoursesFallback);
  const [sponsors, setSponsors] = useState<Sponsor[]>(sponsorsFallback);

  useEffect(() => {
    fetchVolunteers()
      .then(setVolunteers)
      .catch(() => setVolunteers(volunteersFallback));
    fetchPrepCourses()
      .then(setPrepCourses)
      .catch(() => setPrepCourses(prepCoursesFallback));
    fetchSponsors()
      .then(setSponsors)
      .catch(() => setSponsors(sponsorsFallback));
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchAboutSectionData()
      .then(setData)
      .catch(() => setData(aboutFallback));
  }, []);

  return (
    <BaseTemplate solid position="relative">
      <div className="relative bg-white overflow-hidden">
        {/* Triângulo decorativo canto superior esquerdo */}
        <div
          className="absolute top-0 left-0 w-40 h-40 pointer-events-none"
          style={{ background: "#8CC408", clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
        />

        {/* Seção: Quem Somos */}
        <div className="max-w-3xl mx-auto px-6 pt-16">
          <Text size="secondary">Quem Somos?</Text>
          <div className="prose prose-xl max-w-none">
            <RichTextRenderer content={data.description} contentFormat="markdown" className="text-marine text-base" />
          </div>
        </div>

        {/* Seção: História do Projeto */}
        <div className="max-w-5xl mx-auto px-6 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="h-64 md:h-96 rounded-2xl overflow-hidden">
              <AboutVideoCard thumbnail={data.thumbnail} videoId={data.videoId} />
            </div>
            <div>
              <Text size="secondary" className="text-left mb-4">
                História do Projeto
              </Text>
              <p className="text-marine text-base leading-relaxed whitespace-pre-line">
                {HISTORIA_TEXT}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seção: Nossos Valores */}
      <NossosValores />

      {/* Seção: Voluntários */}
      <Section id="volunteers" theme="neutral">
        <VolunteersSection id="volunteers" data={volunteers} />
      </Section>

      {/* Seção: Cursinhos Parceiros + Apoiadores */}
      <Section id="partners" theme="neutral">
        <PartnersTabs prepCourses={prepCourses} sponsors={sponsors} />
      </Section>
    </BaseTemplate>
  );
}
