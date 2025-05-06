
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { Editor } from "@/components/NoteEditor/Editor";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { useParams } from "react-router-dom";

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

const NotePage = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div>Note ID is required</div>;
  }

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full">
        <Sidebar />
        <main className="flex-1 overflow-hidden relative">
          <FloatingSidebarTrigger />
          <Editor noteId={id} />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default NotePage;
