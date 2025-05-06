import { Button } from "@/components/ui/button";
import { Sidebar as SidebarComponent, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { FileText, FolderOpen, PenLine, Image, Star, LayoutGrid } from "lucide-react";
import { useNoteStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";
export function Sidebar() {
  const createNote = useNoteStore(state => state.createNote);
  const navigate = useNavigate();
  const handleCreateNote = () => {
    const newNoteId = createNote();
    navigate(`/note/${newNoteId}`);
  };
  return <SidebarComponent>
      <SidebarHeader className="flex justify-between items-center p-4">
        <div className="flex items-center gap-2">
          <PenLine className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">ScribbleSnap</h1>
        </div>
        <SidebarTrigger />
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <div className="my-4">
          <Button className="w-full flex items-center gap-2" onClick={handleCreateNote}>
            <FileText className="h-4 w-4" />
            <span>New Note</span>
          </Button>
        </div>
        
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/" className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5" />
                <span>All Notes</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/starred" className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                <span>Focus Mode
              </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/drawings" className="flex items-center gap-2">
                <PenLine className="h-5 w-5" />
                <span>Exam Prep</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/attachments" className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                <span>Upload Notes / Documents</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        <div className="pt-4 pb-2">
          <h3 className="px-4 text-sm font-medium text-muted-foreground">Categories</h3>
        </div>
        
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/category/personal" className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-note-purple" />
                <span>Math</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/category/work" className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-note-blue" />
                <span>Physics</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/category/study" className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-note-green" />
                <span>Chemistry</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/category/ideas" className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-note-purple\n" />
                <span>English</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t flex justify-end">
        <ThemeToggle />
      </SidebarFooter>
    </SidebarComponent>;
}