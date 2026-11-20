import { EssayReview } from "@/dtos/essay";

interface ScoreOverviewProps {
  review: EssayReview;
}

export default function ScoreOverview({ review }: ScoreOverviewProps) {
  return (
    <div className="border rounded-lg p-6 bg-white text-center">
      <h2 className="text-body text-muted-foreground mb-2">Nota</h2>
      <div className="text-h1 font-bold text-foreground">
        {review.totalScore}
      </div>
      <div className="text-body text-muted-foreground mt-1">de 1000</div>
    </div>
  );
}
