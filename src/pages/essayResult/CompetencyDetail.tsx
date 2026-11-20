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
        <span className="text-lg font-bold text-foreground">{score}</span>
      </div>
      <div className="h-2 bg-muted rounded-full mb-3">
        <div
          className="h-2 bg-primary rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-sm text-foreground mb-2">{feedback}</p>
      {suggestion && (
        <p className="text-sm text-muted-foreground italic">
          <strong>Sugestão:</strong> {suggestion}
        </p>
      )}
    </div>
  );
}
