import { PageHeader, PageShell } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AboutSection from "./sections/AboutSection";
import FeaturesSection from "./sections/FeaturesSection";
import SupportersSection from "./sections/SupportersSection";

function DashHome() {
  return (
    <PageShell className="max-w-4xl">
      <PageHeader title="Conteúdo da Home" />
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="w-full justify-start h-auto flex-wrap bg-muted p-1">
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
    </PageShell>
  );
}

export default DashHome;
