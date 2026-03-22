interface WordCounterProps {
  text: string;
}

export default function WordCounter({ text }: WordCounterProps) {
  const words = text.split(/\s+/).filter(Boolean).length;
  const lines = text.split("\n").length;
  const chars = text.length;

  const idealMin = 200;
  const idealMax = 500;
  const pct = Math.min(100, Math.round((words / idealMax) * 100));

  const color =
    words >= idealMin && words <= idealMax
      ? "bg-green-500"
      : words > idealMax
        ? "bg-yellow-500"
        : "bg-marine";

  return (
    <div className="flex items-center gap-4 text-sm text-grey">
      <span>Palavras: {words}</span>
      <span>Linhas: {lines}</span>
      <span>Caracteres: {chars}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full max-w-[200px]">
        <div
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
