interface WordCounterProps {
  text: string;
  wordCount?: number;
}

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^>\s/gm, "")
    .replace(/^[-*+]\s/gm, "")
    .replace(/^\d+\.\s/gm, "");
}

export default function WordCounter({ text, wordCount }: WordCounterProps) {
  const plain = stripMarkdown(text);
  const words = wordCount ?? plain.split(/\s+/).filter(Boolean).length;
  const lines = text.split("\n").length;
  const chars = plain.length;

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
