import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Pen } from "lucide-react";
import { CSSProperties, ReactNode } from "react";

interface TabsContainerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  textContent: ReactNode;
  drawContent: ReactNode;
}

export function TabsContainer({ 
  activeTab, 
  setActiveTab, 
  textContent, 
  drawContent
}: TabsContainerProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="px-4 pt-2 sticky top-0 z-10 bg-background border-b">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Text</span>
          </TabsTrigger>
          <TabsTrigger value="draw" className="flex items-center gap-2">
            <Pen className="h-4 w-4" />
            <span>Draw</span>
          </TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="text" className="flex-1 flex flex-col p-4 pt-0 overflow-hidden">
        {textContent}
      </TabsContent>
      
      <TabsContent value="draw" className="flex-1 p-0 overflow-hidden">
        {drawContent}
      </TabsContent>
    </Tabs>
  );
}
