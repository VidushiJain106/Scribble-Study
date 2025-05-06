import { Button } from "@/components/ui/button";
import { Sidebar as SidebarComponent, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { FileText, FolderOpen, PenLine, Image, Star, LayoutGrid, FolderPlus } from "lucide-react";
import { useNoteStore } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function Sidebar() {
  const createNote = useNoteStore(state => state.createNote);
  const createCategory = useNoteStore(state => state.createCategory);
  const categories = useNoteStore(state => state.categories);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const handleCreateNote = () => {
    const newNoteId = createNote();
    navigate(`/note/${newNoteId}`);
  };

  const handleCreateCategory = () => {
    if (newCategory.trim()) {
      createCategory(newCategory.trim());
      setNewCategory("");
      setNewCategoryOpen(false);
      toast({
        title: "Category created",
        description: `New category "${newCategory}" has been created`
      });
    }
  };

  return <SidebarComponent>
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
        
        <div className="pt-4 pb-2 flex items-center justify-between">
          <h3 className="px-4 text-sm font-medium text-muted-foreground">Categories</h3>
          <Button variant="ghost" size="icon" onClick={() => setNewCategoryOpen(true)}>
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
        
        <SidebarMenu>
          {categories && categories.map((category) => (
            <SidebarMenuItem key={category}>
              <SidebarMenuButton asChild>
                <a href={`/category/${category.toLowerCase()}`} className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-note-purple" />
                  <span>{category}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {!categories && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/category/math" className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-note-purple" />
                    <span>Math</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/category/physics" className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-note-blue" />
                    <span>Physics</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/category/chemistry" className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-note-purple" />
                    <span>Chemistry</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/category/english" className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-note-purple" />
                    <span>English</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t flex justify-end">
        <ThemeToggle />
      </SidebarFooter>

      <Dialog open={newCategoryOpen} onOpenChange={setNewCategoryOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateCategory();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewCategoryOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCategory}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarComponent>;
}
