
import { useState } from "react";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { ExamCalendar } from "@/components/ExamPrep/ExamCalendar";
import { SubjectCards } from "@/components/ExamPrep/SubjectCards";

// Create a component for the floating trigger that will be conditionally rendered
const FloatingSidebarTrigger = () => {
  const { open } = useSidebar();
  
  // Don't render the trigger if the sidebar is open
  if (open) return null;
  
  return (
    <div className="absolute top-4 left-4 z-10">
      <SidebarTrigger className="bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-sm">
        <Menu className="h-5 w-5" />
      </SidebarTrigger>
    </div>
  );
};

const ExamPrepPage = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <main className="flex-1 p-6 relative">
          <FloatingSidebarTrigger />
          <h1 className="text-2xl font-bold mb-6">Exam Preparation</h1>
          
          <div className="space-y-8">
            <ExamCalendar />
            <SubjectCards />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ExamPrepPage;
