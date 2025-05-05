
import { useNoteStore } from "@/lib/store";
import { Shape } from "@/types";
import { Square, Circle, Minus, ArrowRight } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function ShapeSelector() {
  const activeShape = useNoteStore(state => state.activeShape);
  const setActiveShape = useNoteStore(state => state.setActiveShape);
  
  const shapes: { label: string; value: Shape; icon: React.ReactNode }[] = [
    { label: "Rectangle", value: "rectangle", icon: <Square className="h-4 w-4" /> },
    { label: "Circle", value: "circle", icon: <Circle className="h-4 w-4" /> },
    { label: "Line", value: "line", icon: <Minus className="h-4 w-4" /> },
    { label: "Arrow", value: "arrow", icon: <ArrowRight className="h-4 w-4" /> },
  ];
  
  const activeShapeIcon = shapes.find(s => s.value === activeShape)?.icon || shapes[0].icon;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 relative"
          aria-label="Select shape"
        >
          {activeShapeIcon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {shapes.map(shape => (
          <DropdownMenuItem 
            key={shape.value}
            onClick={() => setActiveShape(shape.value)}
            className="flex items-center gap-2"
          >
            {shape.icon}
            <span>{shape.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
