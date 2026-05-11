import { useEffect, useState } from "react";
import { GraduationCap, School, Users, BookOpen, FileText } from "lucide-react";
import { fetchImpactStats, ImpactStats } from "@/services/public/impactStats";

interface StatItem {
  icon: React.ReactNode;
  value: number | null;
  label: string;
}

function ImpactCard({ icon, value, label }: { icon: React.ReactNode; value: number | null; label: string }) {
  const formatted =
    value === null ? "—" : value.toLocaleString("pt-BR");

  return (
    <div className="flex flex-col items-center gap-2 bg-white rounded-2xl shadow-md px-6 py-8 min-w-[160px] flex-1">
      <div className="w-12 h-12 rounded-full bg-marine/10 flex items-center justify-center text-marine mb-1">
        {icon}
      </div>
      <span className="text-3xl font-extrabold text-marine leading-none">
        {formatted}
      </span>
      <span className="text-sm text-gray-500 text-center leading-snug">{label}</span>
    </div>
  );
}

export function ImpactoSection() {
  const [stats, setStats] = useState<ImpactStats | null>(null);

  useEffect(() => {
    fetchImpactStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  const cards: StatItem[] = [
    {
      icon: <GraduationCap size={24} />,
      value: stats?.studentsServed ?? null,
      label: "Estudantes atendidos",
    },
    {
      icon: <School size={24} />,
      value: stats?.partnerCourses ?? null,
      label: "Cursinhos parceiros",
    },
    {
      icon: <Users size={24} />,
      value: stats?.studentsEnrolled ?? null,
      label: "Estudantes ativos",
    },
    {
      icon: <BookOpen size={24} />,
      value: stats?.questionsTotal ?? null,
      label: "Questões cadastradas",
    },
    {
      icon: <FileText size={24} />,
      value: stats?.contentApproved ?? null,
      label: "Conteúdos disponibilizados",
    },
  ];

  return (
    <div className="bg-gray-50 py-20">
      <div className="max-w-5xl mx-auto px-6">
        <p className="text-xs font-semibold tracking-widest uppercase mb-3 text-center text-marine/60">
          NOSSOS NÚMEROS
        </p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-marine text-center leading-tight mb-4">
          Impacto do Projeto
        </h2>
        <p className="text-base text-gray-600 text-center max-w-2xl mx-auto leading-relaxed mb-12">
          Desde o início, o Você na Facul conecta estudantes a oportunidades reais de acesso
          ao ensino superior. Esses são os números que traduzem o nosso impacto — cada dado
          representa uma história de dedicação e superação.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {cards.map((c) => (
            <ImpactCard key={c.label} icon={c.icon} value={c.value} label={c.label} />
          ))}
        </div>
      </div>
    </div>
  );
}
