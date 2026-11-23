import { motion } from "motion/react";
import { palette } from "@/lib/palette";
import { NewsItem } from "../../adapters/newsAdapter";

// Texto branco sobre o fim do gradiente: o degradê termina no passo 600 (AA com branco), não no 400.
const CAT_BG: Record<NewsItem["category"], string> = {
  DESTAQUE: `linear-gradient(to bottom right, ${palette.marine[900]}, ${palette.pink[600]})`,
  NOTÍCIA: `linear-gradient(to bottom right, ${palette.marine[900]}, ${palette.mint[600]})`,
  EVENTO: `linear-gradient(to bottom right, ${palette.marine[900]}, ${palette.mint[600]})`,
  PARCERIA: `linear-gradient(to bottom right, ${palette.marine[900]}, ${palette.yellow[600]})`,
};

export function NewsFeaturedCard({ item }: { item: NewsItem }) {
  return (
    <motion.a
      href={item.href}
      whileHover={{ scale: 1.005 }}
      style={{ backgroundImage: CAT_BG[item.category] }}
      className="relative rounded-2xl overflow-hidden block h-[320px] md:h-full"
    >
      <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-primary-foreground">
        <span className="self-start mb-3 text-caption tracking-widest font-bold uppercase bg-primary-foreground/20 backdrop-blur px-3 py-1 rounded-full">
          {item.category}
        </span>
        <h3 className="text-h1 line-clamp-3">
          {item.title}
        </h3>
        {item.description && (
          <p className="mt-3 text-prose line-clamp-3">
            {item.description}
          </p>
        )}
        {item.publishedAt && (
          <p className="mt-3 text-body opacity-80">{item.publishedAt}</p>
        )}
      </div>
    </motion.a>
  );
}
