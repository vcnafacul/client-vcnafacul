import { Sponsor } from "../../adapters/sponsorsAdapter";

interface Props {
  items: Sponsor[];
  direction: "left" | "right";
  durationSec: number;
}

export function SponsorMarquee({ items, direction, durationSec }: Props) {
  // Render the list twice for seamless loop.
  const repeated = [...items, ...items];
  return (
    <div className="overflow-hidden group" data-marquee>
      <div
        className="flex gap-4 will-change-transform motion-reduce:!animate-none"
        style={{
          animation: `marquee-${direction} ${durationSec}s linear infinite`,
        }}
      >
        {repeated.map((s, i) => (
          <a
            key={`${s.alt}-${i}`}
            href={s.link}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex-shrink-0 w-[160px] h-[80px] bg-white rounded-xl
              border border-black/5 flex items-center justify-center
              grayscale opacity-60
              transition-all duration-300
              hover:grayscale-0 hover:opacity-100 hover:scale-110
              focus-visible:outline outline-2 outline-offset-2 outline-[#f7b733]
            "
          >
            <img src={s.logoUrl} alt={s.alt} className="max-w-[80%] max-h-[60%] object-contain" />
          </a>
        ))}
      </div>
      <style>{`
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        [data-marquee]:hover > div { animation-play-state: paused; }
        [data-marquee]:focus-within > div { animation-play-state: paused; }
      `}</style>
    </div>
  );
}
