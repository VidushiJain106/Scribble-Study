
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { Editor } from "@/components/NoteEditor/Editor";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useParams } from "react-router-dom";

const NotePage = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div>Note ID is required</div>;
  }

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Editor noteId={id} />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default NotePage;
