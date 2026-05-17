import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AboutSection from "./sections/AboutSection";
import FeaturesSection from "./sections/FeaturesSection";
import SupportersSection from "./sections/SupportersSection";

function DashHome() {
  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Conteúdo da Home</h1>
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="w-full justify-start h-auto flex-wrap bg-gray-100 p-1">
          <TabsTrigger value="about">Quem Somos</TabsTrigger>
          <TabsTrigger value="features">Futuro do Cursinho Popular</TabsTrigger>
          <TabsTrigger value="supporters">Apoiadores</TabsTrigger>
        </TabsList>
        <TabsContent value="about">
          <AboutSection />
        </TabsContent>
        <TabsContent value="features">
          <FeaturesSection />
        </TabsContent>
        <TabsContent value="supporters">
          <SupportersSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DashHome;
