import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface ModalTabsTemplateProps {
  tabs: {
    label: string;
    children: React.ReactNode;
  }[];
}

export function ModalTabsTemplate({ tabs }: ModalTabsTemplateProps) {
  return (
    <div
      className="absolute z-[99] w-screen h-screen top-0 left-0 flex pb-20 
    justify-center items-start md:pt-8 bg-black/60 overflow-y-auto scrollbar-hide"
    >
      <Tabs defaultValue={tabs[0].label} className="bg-white md:bg-transparent w-screen md:w-fit">
        <TabsList>
          {tabs.map((tab, index) => (
            <TabsTrigger key={index} value={tab.label}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab, index) => (
          <TabsContent key={index} value={tab.label}>
            {tab.children}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
