// client-vcnafacul/src/pages/homeV2/sections/PrepCoursesSection/PrepCourseCard.tsx
import { motion } from "motion/react";
import { PrepCourse } from "../../adapters/prepCoursesAdapter";

export function PrepCourseCard({
  course,
  index,
}: {
  course: PrepCourse;
  index: number;
}) {
  return (
    <motion.a
      href={course.link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, delay: 0.08 * index, ease: "easeOut" }}
      className="
        bg-white rounded-2xl p-5 md:p-6 shadow-md
        grid grid-cols-[60px_1fr_auto] gap-4 items-center
        transition-shadow hover:shadow-lg hover:ring-1 hover:ring-[#37d6b5]
        focus-visible:outline outline-2 outline-offset-2 outline-[#37d6b5]
      "
    >
      <div className="w-[60px] h-[60px] bg-white border border-black/10 rounded-xl flex items-center justify-center overflow-hidden">
        <img src={course.logoUrl} alt={course.alt} className="max-w-full max-h-full object-contain" />
      </div>
      <div>
        <p className="font-bold text-lg">{course.name ?? course.alt}</p>
        {course.city && <p className="text-sm opacity-65">{course.city}</p>}
      </div>
      <span className="text-sm font-semibold text-[#37d6b5]">Visitar →</span>
    </motion.a>
  );
}
