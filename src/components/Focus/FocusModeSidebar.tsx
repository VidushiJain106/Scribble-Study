
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { FileText, PenLine, Clock, Timer, FolderOpen, LayoutGrid, GraduationCap } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export function FocusModeSidebar() {
  const navigate = useNavigate();

  const handleCreateNote = () => {
    navigate('/note/new');
  };

  return <Sidebar>
      <SidebarHeader className="flex justify-between items-center p-4">
        <div className="flex items-center gap-2">
          <PenLine className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">ScribbleSnap</h1>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <div className="my-4 flex gap-2">
          <Button className="flex-1 flex items-center gap-2" onClick={handleCreateNote}>
            <FileText className="h-4 w-4" />
            <span>New Note</span>
          </Button>
          <SidebarTrigger className="h-10" />
        </div>
        
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/" className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5" />
                <span>All Notes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="bg-primary/10 text-primary font-medium">
              <Link to="/focus" className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>Focus Mode</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/exam-prep" className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                <span>Exam Prep</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/documents" className="flex items-center gap-2">
                <PenLine className="h-5 w-5" />
                <span>Upload Notes / Documents</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        <div className="pt-4 pb-2 flex items-center justify-between">
          <h3 className="px-4 text-sm font-medium text-muted-foreground">Recent Focus</h3>
        </div>
        
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/focus" className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-note-purple" />
                <span>Deep Work</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/focus" className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-note-blue" />
                <span>Study Time</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t flex justify-end">
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>;
}
