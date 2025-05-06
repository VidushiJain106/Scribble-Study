import { Button } from "@/components/ui/button";
import { Sidebar as SidebarComponent, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { FileText, FolderOpen, PenLine, Image, Star, LayoutGrid, FolderPlus, ChevronDown, ChevronRight, Plus, Clock, GraduationCap } from "lucide-react";
import { useNoteStore } from "@/lib/store";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Sidebar() {
  const createNote = useNoteStore(state => state.createNote);
  const createCategory = useNoteStore(state => state.createCategory);
  const categories = useNoteStore(state => state.categories);
  const categoryItems = useNoteStore(state => state.categoryItems);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [parentCategory, setParentCategory] = useState<string | undefined>(undefined);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const handleCreateNote = () => {
    const newNoteId = createNote();
    navigate(`/note/${newNoteId}`);
  };

  const handleCreateCategory = () => {
    if (newCategory.trim()) {
      createCategory(newCategory.trim(), parentCategory);
      setNewCategory("");
      setParentCategory(undefined);
      setNewCategoryOpen(false);
      toast({
        title: "Category created",
        description: parentCategory 
          ? `New subcategory "${newCategory}" has been created under "${parentCategory}"`
          : `New category "${newCategory}" has been created`
      });
    }
  };

  const toggleCategoryExpanded = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Get top-level categories (those without parents)
  const topLevelCategories = categoryItems.filter(item => !item.parent);

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
              <Link to="/" className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5" />
                <span>All Notes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
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
                <Image className="h-5 w-5" />
                <span>Upload Notes / Documents</span>
              </Link>
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
          {topLevelCategories.length > 0 ? (
            topLevelCategories.map((categoryItem) => (
              <SidebarMenuItem key={categoryItem.name}>
                <SidebarMenuButton 
                  asChild 
                  className="justify-between"
                  onClick={() => categoryItem.subCategories?.length && toggleCategoryExpanded(categoryItem.name)}
                >
                  <a href={`/category/${categoryItem.name.toLowerCase()}`} className="flex items-center gap-2 w-full">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5 text-note-purple" />
                      <span>{categoryItem.name}</span>
                    </div>
                    {categoryItem.subCategories?.length ? (
                      expandedCategories[categoryItem.name] ? (
                        <ChevronDown className="h-4 w-4 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 flex-shrink-0" />
                      )
                    ) : null}
                  </a>
                </SidebarMenuButton>
                
                {categoryItem.subCategories?.length && expandedCategories[categoryItem.name] && (
                  <SidebarMenuSub>
                    {categoryItem.subCategories.map(subCat => {
                      return (
                        <SidebarMenuSubItem key={subCat}>
                          <SidebarMenuSubButton asChild>
                            <a href={`/category/${subCat.toLowerCase()}`}>
                              {subCat}
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton 
                        onClick={() => {
                          setNewCategoryOpen(true);
                          setParentCategory(categoryItem.name);
                        }}
                        className="text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add subcategory</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            ))
          ) : (
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
            <DialogTitle>
              {parentCategory ? `Create New Subcategory in ${parentCategory}` : "Create New Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Input
              placeholder="Category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateCategory();
              }}
            />
            
            {!parentCategory && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Parent Category (Optional)
                </label>
                <Select value={parentCategory} onValueChange={setParentCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="None (Top-level category)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={undefined}>None (Top-level category)</SelectItem>
                    {topLevelCategories.map(cat => (
                      <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setNewCategoryOpen(false);
              setNewCategory("");
              setParentCategory(undefined);
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarComponent>;
}
