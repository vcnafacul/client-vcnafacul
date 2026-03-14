import { ReactComponent as Arrow } from "../../../assets/icons/arrow.svg";
import { News } from "../../../dtos/news/news";

interface NewsSelectorProps {
  news: News[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

function NewsSelector({ news, selectedIndex, onSelect }: NewsSelectorProps) {
  const canGoPrev = selectedIndex > 0;
  const canGoNext = selectedIndex < news.length - 1;

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, news.length - 1));
    onSelect(clamped);
  };

  const visibleItems = [-1, 0, 1]
    .map((offset) => ({
      index: selectedIndex + offset,
      position: offset,
    }))
    .filter((item) => item.index >= 0 && item.index < news.length);

  if (news.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-md mx-auto">
      {/* Up arrow */}
      <button
        onClick={() => goTo(selectedIndex - 1)}
        disabled={!canGoPrev}
        className={`p-2 transition-opacity ${
          canGoPrev ? "hover:opacity-70 cursor-pointer" : "opacity-20 cursor-default"
        }`}
        aria-label="Anterior"
      >
        <Arrow className="w-6 h-6 -rotate-90 fill-grey" />
      </button>

      {/* Items */}
      <div className="relative w-full overflow-hidden" style={{ height: "168px" }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          {visibleItems.map(({ index, position }) => {
            const item = news[index];
            const isSelected = position === 0;
            const isEdge = position !== 0;

            return (
              <div
                key={item.id}
                onClick={() => onSelect(index)}
                className={`
                  w-full px-5 py-3 rounded-lg cursor-pointer
                  transition-all duration-300 ease-in-out
                  flex items-center gap-3
                  ${
                    isSelected
                      ? "bg-green2 text-white shadow-lg scale-100"
                      : "bg-grey bg-opacity-30 text-grey hover:bg-opacity-50"
                  }
                  ${isEdge ? "opacity-50 scale-95" : "opacity-100"}
                `}
              >
                <span
                  className={`text-xs font-mono shrink-0 ${
                    isSelected ? "text-white/70" : "text-grey/50"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={`truncate text-sm ${
                    isSelected ? "font-semibold" : "font-normal"
                  }`}
                >
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Down arrow */}
      <button
        onClick={() => goTo(selectedIndex + 1)}
        disabled={!canGoNext}
        className={`p-2 transition-opacity ${
          canGoNext ? "hover:opacity-70 cursor-pointer" : "opacity-20 cursor-default"
        }`}
        aria-label="Próximo"
      >
        <Arrow className="w-6 h-6 rotate-90 fill-grey" />
      </button>
    </div>
  );
}

export default NewsSelector;
