import { motion } from "motion/react";
import { NewsItem } from "../../adapters/newsAdapter";

const CAT_BG: Record<NewsItem["category"], string> = {
  DESTAQUE: "bg-[#fff5f8]",
  NOTÍCIA: "bg-[#37d6b5] text-[#0b2747]",
  EVENTO: "bg-[#edfef8]",
  PARCERIA: "bg-[#fffaee]",
};

export function NewsSideCard({ item, index }: { item: NewsItem; index: number }) {
  return (
    <motion.a
      href={item.href}
      whileHover={{ scale: 1.01 }}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.4, delay: 0.07 * index }}
      className={[
        "rounded-xl p-4 flex-1 block transition-shadow hover:shadow",
        CAT_BG[item.category],
      ].join(" ")}
    >
      <span className="text-[10px] tracking-widest font-bold uppercase opacity-70">
        {item.category}
      </span>
      <h4 className="mt-1 text-lg md:text-xl font-bold leading-snug line-clamp-2">
        {item.title}
      </h4>
      {item.publishedAt && (
        <p className="text-xs opacity-60 mt-1">{item.publishedAt}</p>
      )}
    </motion.a>
  );
}
