import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PrepCoursesSection } from "../homeV2/sections/PrepCoursesSection";
import { SponsorsSection } from "../homeV2/sections/SponsorsSection";
import { PrepCourse } from "../homeV2/adapters/prepCoursesAdapter";
import { Sponsor } from "../homeV2/adapters/sponsorsAdapter";

interface Props {
  prepCourses: PrepCourse[];
  sponsors: Sponsor[];
}

export function PartnersTabs({ prepCourses, sponsors }: Props) {
  return (
    <Tabs defaultValue="cursinhos" className="w-full">
      <div className="flex justify-center mb-10">
        <TabsList className="h-11 px-1 bg-gray-100 rounded-full">
          <TabsTrigger
            value="cursinhos"
            className="rounded-full px-6 py-2 text-sm font-semibold data-[state=active]:bg-marine data-[state=active]:text-white"
          >
            Cursinhos Parceiros
          </TabsTrigger>
          <TabsTrigger
            value="apoiadores"
            className="rounded-full px-6 py-2 text-sm font-semibold data-[state=active]:bg-marine data-[state=active]:text-white"
          >
            Apoiadores
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="cursinhos">
        <PrepCoursesSection id="prep-courses" data={prepCourses} />
      </TabsContent>

      <TabsContent value="apoiadores">
        <SponsorsSection id="sponsors" data={sponsors} />
      </TabsContent>
    </Tabs>
  );
}
