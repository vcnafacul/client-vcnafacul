import { motion } from "motion/react";
import { NewsItem } from "../../adapters/newsAdapter";

const CAT_BG: Record<NewsItem["category"], string> = {
  DESTAQUE: "from-[#0b2747] to-[#da005a]",
  NOTÍCIA: "from-[#0b2747] to-[#37d6b5]",
  EVENTO: "from-[#0b2747] to-[#37d6b5]",
  PARCERIA: "from-[#0b2747] to-[#f7b733]",
};

export function NewsFeaturedCard({ item }: { item: NewsItem }) {
  return (
    <motion.a
      href={item.href}
      whileHover={{ scale: 1.005 }}
      className={[
        "relative rounded-2xl overflow-hidden group block",
        "h-[320px] md:h-full",
        "bg-gradient-to-br",
        CAT_BG[item.category],
      ].join(" ")}
    >
      {item.thumbnailUrl && (
        <img
          src={item.thumbnailUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity"
          loading="eager"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-white">
        <span className="self-start mb-3 text-[10px] tracking-widest font-bold uppercase bg-white/20 backdrop-blur px-3 py-1 rounded-full">
          {item.category}
        </span>
        <h3 className="text-2xl md:text-3xl font-extrabold leading-tight line-clamp-3">
          {item.title}
        </h3>
        {item.publishedAt && (
          <p className="mt-2 text-xs opacity-75">{item.publishedAt}</p>
        )}
      </div>
    </motion.a>
  );
}
