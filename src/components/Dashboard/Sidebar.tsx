
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, FolderPlus, FileText, Clock, GraduationCap, PenLine } from "lucide-react";
import { useNoteStore } from "@/lib/store";
import { useCategoryStore } from "@/lib/categoryStore";
import { UserMenu } from "./UserMenu";
import { useState } from "react";
import { NoteCategory } from "@/types";
import { useSidebar } from "@/components/ui/sidebar";

export function Sidebar() {
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();
  const createNote = useNoteStore(state => state.createNote);
  const createCategory = useCategoryStore(state => state.createCategory);
  const categories = useCategoryStore(state => state.categories);
  const categoryItems = useCategoryStore(state => state.categoryItems);
  const [newCategoryName, setNewCategoryName] = useState("");
  
  const handleCreateCategory = () => {
    if (newCategoryName.trim() !== "") {
      createCategory(newCategoryName);
      setNewCategoryName("");
    }
  };
  
  const handleCategoryClick = (category: string) => {
    navigate(`/?category=${category}`);
    setOpenMobile(false); // Close the sidebar on mobile when clicking a category
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpenMobile(false); // Close the sidebar on mobile when navigating
  };

  return (
    <aside className="border-r flex flex-col w-64 py-4 h-full">
      <div className="px-6">
        <Button 
          variant="ghost" 
          className="justify-start w-full mb-4"
          onClick={() => {
            navigate("/");
            setOpenMobile(false);
          }}
        >
          ScribbleSnap
        </Button>
        <Separator className="mb-4" />
      </div>
      
      <div className="px-6">
        <h4 className="mb-2 font-semibold text-sm">Add Category</h4>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-full"
          />
          <Button size="icon" onClick={handleCreateCategory}>
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="flex-1 px-6 overflow-y-auto">
        <h4 className="mb-2 font-semibold text-sm">Navigation</h4>
        <Button 
          variant="ghost" 
          className="justify-start w-full mb-2 flex items-center gap-2"
          onClick={() => handleNavigate("/")}
        >
          <FileText className="h-4 w-4" />
          All Notes
        </Button>
        
        <Button 
          variant="ghost" 
          className="justify-start w-full mb-2 flex items-center gap-2"
          onClick={() => handleNavigate("/focus")}
        >
          <Clock className="h-4 w-4" />
          Focus Mode
        </Button>
        
        <Button 
          variant="ghost" 
          className="justify-start w-full mb-2 flex items-center gap-2"
          onClick={() => handleNavigate("/exam-prep")}
        >
          <GraduationCap className="h-4 w-4" />
          Exam Prep
        </Button>
        
        <Button 
          variant="ghost" 
          className="justify-start w-full mb-2 flex items-center gap-2"
          onClick={() => handleNavigate("/documents")}
        >
          <PenLine className="h-4 w-4" />
          Upload Documents
        </Button>

        <Separator className="my-4" />
        
        <h4 className="mb-2 font-semibold text-sm">Categories</h4>
        {categories.map((category) => (
          <Button
            key={category}
            variant="ghost"
            className="justify-start w-full"
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </Button>
        ))}
      </div>
      
      <Separator className="my-4" />
      
      <div className="px-6">
        <UserMenu />
      </div>
    </aside>
  );
}
