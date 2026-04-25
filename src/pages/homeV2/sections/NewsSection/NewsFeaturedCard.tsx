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
        "relative rounded-2xl overflow-hidden block",
        "h-[320px] md:h-full",
        "bg-gradient-to-br",
        CAT_BG[item.category],
      ].join(" ")}
    >
      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-white">
        <span className="self-start mb-3 text-[10px] tracking-widest font-bold uppercase bg-white/20 backdrop-blur px-3 py-1 rounded-full">
          {item.category}
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight line-clamp-4">
          {item.title}
        </h1>
        {item.publishedAt && (
          <p className="mt-3 text-sm opacity-80">{item.publishedAt}</p>
        )}
      </div>
    </motion.a>
  );
}
