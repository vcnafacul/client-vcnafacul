// client-vcnafacul/src/pages/homeV2/sections/AboutSection/AboutVideoCard.tsx
import { useState } from "react";
import { motion } from "motion/react";
import { AboutVideoModal } from "./AboutVideoModal";

export function AboutVideoCard({ thumbnail, videoId }: { thumbnail: string; videoId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <AboutVideoModal
      videoId={videoId}
      open={open}
      onOpenChange={setOpen}
      trigger={
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="
            relative w-full h-full block bg-black rounded-tl-3xl rounded-bl-3xl
            md:rounded-tl-3xl md:rounded-bl-3xl rounded-2xl
            overflow-hidden group cursor-pointer
            focus-visible:outline outline-2 outline-offset-2 outline-[#37d6b5]
          "
          aria-label="Assistir vídeo: conheça vcnafacul"
        >
          <img
            src={thumbnail}
            alt=""
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="
              absolute inset-0 m-auto h-20 w-20 rounded-full bg-white
              flex items-center justify-center shadow-lg
              motion-reduce:animate-none
            "
          >
            <span
              className="block w-0 h-0 ml-1 border-y-[12px] border-y-transparent border-l-[18px] border-l-[#0b2747]"
            />
          </motion.div>
        </motion.button>
      }
    />
  );
}
