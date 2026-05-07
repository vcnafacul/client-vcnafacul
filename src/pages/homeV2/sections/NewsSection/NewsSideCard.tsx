import { motion } from "motion/react";
import { NewsItem } from "../../adapters/newsAdapter";

export function NewsSideCard({ item, index }: { item: NewsItem; index: number }) {
  return (
    <motion.a
      href={item.href}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.4, delay: 0.07 * index }}
      className="rounded-xl p-4 flex-1 block bg-white text-[#da005a] shadow-md hover:shadow-lg transition-shadow"
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
