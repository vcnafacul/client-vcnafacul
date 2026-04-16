const COMPETENCY_LABELS = [
  "Domínio da língua formal",
  "Compreensão da proposta",
  "Seleção e organização de argumentos",
  "Mecanismos linguísticos (coesão)",
  "Proposta de intervenção",
];

interface CompetencyDetailProps {
  number: number;
  score: number;
  feedback: string;
  suggestion: string;
}

export default function CompetencyDetail({
  number,
  score,
  feedback,
  suggestion,
}: CompetencyDetailProps) {
  const pct = (score / 200) * 100;

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-sm">
          Competência {number} — {COMPETENCY_LABELS[number - 1]}
        </h3>
        <span className="text-lg font-bold text-marine">{score}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full mb-3">
        <div
          className="h-2 bg-marine rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-sm text-gray-700 mb-2">{feedback}</p>
      {suggestion && (
        <p className="text-sm text-grey italic">
          <strong>Sugestão:</strong> {suggestion}
        </p>
      )}
    </div>
  );
}
