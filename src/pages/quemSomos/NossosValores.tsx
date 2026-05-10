import type { ReactNode } from "react";
import { Eye, Target, Gem } from "lucide-react";
import visaoImg from "../../assets/images/visao.png";
import missaoImg from "../../assets/images/missao.png";
import valoresImg from "../../assets/images/valores.png";

const PINK = "#da005a";
const TEAL = "#37d6b5";
const LIME = "#8dc63f";

const VISAO_TEXT =
  "Ser a principal plataforma de apoio educacional para estudantes de baixa renda, ajudando-os a conquistar uma vaga na faculdade dos sonhos por meio de conteúdos acessíveis, suporte comunitário e estratégias eficazes de estudo.";

const MISSAO_TEXT =
  "Fornecer suporte educacional gratuito e acessível a estudantes de baixa renda, disponibilizando materiais acadêmicos, provas anteriores do ENEM e métodos de estudo para maximizar suas chances de ingresso no ensino superior.";

const VALORES_LIST = [
  "Acessibilidade",
  "Inclusão",
  "Compromisso",
  "Colaboração",
  "Inovação",
];

function ValorCard({
  icon,
  title,
  accent,
  children,
}: {
  icon: ReactNode;
  title: string;
  accent: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full aspect-[572/328] flex flex-col">
      <div className="h-2 shrink-0" style={{ background: accent }} />
      <div className="flex-1 px-10 py-6 flex flex-col justify-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
          style={{ background: accent }}
        >
          {icon}
        </div>
        <h3 className="text-xl font-bold text-marine mb-3">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function ValorRow({
  img,
  imgAlt,
  card,
  reverse = false,
}: {
  img: string;
  imgAlt: string;
  card: ReactNode;
  reverse?: boolean;
}) {
  return (
    <div className="container mx-auto px-4">
      {/* Desktop */}
      <div className={`hidden md:flex items-center ${reverse ? "flex-row-reverse" : ""}`}>
        <div className="shrink-0 w-[58%] rounded-2xl overflow-hidden">
          <img src={img} alt={imgAlt} className="w-full aspect-[691/461] object-cover" />
        </div>
        <div className={`shrink-0 w-[46%] z-10 ${reverse ? "-mr-[4%]" : "-ml-[4%]"}`}>
          {card}
        </div>
      </div>

      {/* Mobile */}
      <div className="flex md:hidden flex-col gap-6">
        <div className="rounded-2xl overflow-hidden">
          <img src={img} alt={imgAlt} className="w-full aspect-[691/461] object-cover" />
        </div>
        {card}
      </div>
    </div>
  );
}

export function NossosValores() {
  return (
    <div className="relative bg-white py-20 md:py-28 flex flex-col gap-16 overflow-hidden">
      {/* Triângulo decorativo canto superior esquerdo */}
      <div
        className="absolute top-0 left-0 w-40 h-40 pointer-events-none"
        style={{ background: "#D96B45", clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
      />
      {/* Triângulo decorativo canto inferior direito */}
      <div
        className="absolute bottom-0 right-0 w-40 h-40 pointer-events-none"
        style={{ background: "#D9AF45", clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
      />
      <div className="container mx-auto px-4 text-center">
        <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: PINK }}>
          O QUE NOS GUIA
        </p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-marine leading-tight">
          Nossos Valores
        </h2>
      </div>

      {/* Visão: imagem esquerda, card direita */}
      <ValorRow
        img={visaoImg}
        imgAlt="Visão do projeto"
        card={
          <ValorCard icon={<Eye size={26} color="white" strokeWidth={2} />} title="Visão" accent={PINK}>
            <p className="text-gray-600 text-base leading-relaxed">{VISAO_TEXT}</p>
          </ValorCard>
        }
      />

      {/* Missão: imagem direita, card esquerda */}
      <ValorRow
        img={missaoImg}
        imgAlt="Missão do projeto"
        reverse
        card={
          <ValorCard icon={<Target size={26} color="white" strokeWidth={2} />} title="Missão" accent={TEAL}>
            <p className="text-gray-600 text-base leading-relaxed">{MISSAO_TEXT}</p>
          </ValorCard>
        }
      />

      {/* Valores: imagem esquerda, card direita */}
      <ValorRow
        img={valoresImg}
        imgAlt="Valores do projeto"
        card={
          <ValorCard icon={<Gem size={26} color="white" strokeWidth={2} />} title="Valores" accent={LIME}>
            <ul className="text-gray-600 text-base space-y-1">
              {VALORES_LIST.map((v) => (
                <li key={v} className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: LIME }}>•</span>
                  {v}
                </li>
              ))}
            </ul>
          </ValorCard>
        }
      />
    </div>
  );
}
