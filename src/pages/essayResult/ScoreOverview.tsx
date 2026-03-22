import { EssayAIReview } from "@/dtos/essay";

interface ScoreOverviewProps {
  review: EssayAIReview;
}

export default function ScoreOverview({ review }: ScoreOverviewProps) {
  return (
    <div className="border rounded-lg p-6 bg-white text-center">
      <h2 className="text-sm text-grey mb-2">Nota da IA</h2>
      <div className="text-5xl font-bold text-marine">
        {review.totalScore}
      </div>
      <div className="text-sm text-grey mt-1">de 1000</div>
    </div>
  );
}
