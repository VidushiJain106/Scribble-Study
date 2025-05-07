import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useDrawingStore } from "@/lib/drawingStore";
import { PenSize, Tool } from "@/types";
import { 
  Eraser, 
  MousePointer, 
  PenLine, 
  Text, 
  Highlighter, 
  Brush, 
  Pencil, 
  Square
} from "lucide-react";
import { ShapeSelector } from "./DrawingTools/ShapeSelector";
import { OpacitySelector } from "./DrawingTools/OpacitySelector";
import { UndoRedoButtons } from "./DrawingTools/UndoRedoButtons";
import { Separator } from "@/components/ui/separator";

export function ToolBar() {
  const activeTool = useDrawingStore(state => state.activeTool);
  const penColor = useDrawingStore(state => state.penColor);
  const penSize = useDrawingStore(state => state.penSize);
  
  const setActiveTool = useDrawingStore(state => state.setActiveTool);
  const setPenColor = useDrawingStore(state => state.setPenColor);
  const setPenSize = useDrawingStore(state => state.setPenSize);
  
  const toolIcons: Record<Tool, React.ReactNode> = {
    select: <MousePointer className="h-4 w-4" />,
    pen: <PenLine className="h-4 w-4" />,
    highlighter: <Highlighter className="h-4 w-4" />,
    eraser: <Eraser className="h-4 w-4" />,
    text: <Text className="h-4 w-4" />,
    marker: <Highlighter className="h-4 w-4" />,
    pencil: <Pencil className="h-4 w-4" />,
    brush: <Brush className="h-4 w-4" />,
    shape: <Square className="h-4 w-4" />
  };
  
  const toolTips: Record<Tool, string> = {
    select: "Select",
    pen: "Pen",
    highlighter: "Highlighter",
    eraser: "Eraser",
    text: "Text",
    marker: "Marker",
    pencil: "Pencil",
    brush: "Brush",
    shape: "Shape"
  };
  
  const displayedTools: Tool[] = [
    "select", 
    "pen", 
    "pencil", 
    "brush", 
    "highlighter", 
    "eraser", 
    "text", 
    "shape"
  ];
  
  const colorOptions = [
    { name: "Black", value: "#000000" },
    { name: "Purple", value: "#9b87f5" },
    { name: "Blue", value: "#0ea5e9" },
    { name: "Green", value: "#10b981" },
    { name: "Yellow", value: "#fbbf24" },
    { name: "Orange", value: "#f97316" },
    { name: "Red", value: "#ef4444" },
    { name: "Gray", value: "#6b7280" },
    { name: "Pink", value: "#ec4899" },
    { name: "Teal", value: "#14b8a6" },
  ];
  
  const sizeOptions: { name: string; value: PenSize }[] = [
    { name: "Small", value: "small" },
    { name: "Medium", value: "medium" },
    { name: "Large", value: "large" },
    { name: "Extra Large", value: "xlarge" }
  ];
  
  const getSizeInPixels = (size: PenSize): number => {
    switch (size) {
      case "small": return 2;
      case "medium": return 4;
      case "large": return 8;
      case "xlarge": return 12;
    }
  };

  return (
    <div className="flex items-center space-x-2 bg-card p-2 rounded-lg shadow-sm border">
      {/* Tool Buttons */}
      <div className="flex space-x-1 pr-2 border-r">
        {displayedTools.map(tool => (
          <Button
            key={tool}
            variant={activeTool === tool ? "default" : "ghost"}
            size="icon"
            onClick={() => setActiveTool(tool)}
            aria-label={toolTips[tool]}
            className="h-8 w-8"
          >
            {toolIcons[tool]}
          </Button>
        ))}
      </div>
      
      {/* Colors */}
      {(activeTool === "pen" || activeTool === "highlighter" || activeTool === "marker" || 
       activeTool === "pencil" || activeTool === "brush" || activeTool === "shape") && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 relative"
              aria-label="Select color"
            >
              <div 
                className="absolute inset-2 rounded-full" 
                style={{ backgroundColor: penColor }} 
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <div className="grid grid-cols-5 gap-1 p-1">
              {colorOptions.map(color => (
                <div
                  key={color.value}
                  className={`h-6 w-6 rounded-full cursor-pointer ${
                    penColor === color.value ? "ring-2 ring-primary" : ""
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                  onClick={() => setPenColor(color.value)}
                />
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      
      {/* Opacity Selector */}
      {(activeTool === "pen" || activeTool === "highlighter" || activeTool === "marker" || 
       activeTool === "pencil" || activeTool === "brush") && (
        <OpacitySelector />
      )}
      
      {/* Pen Size */}
      {(activeTool === "pen" || activeTool === "highlighter" || activeTool === "eraser" || 
       activeTool === "marker" || activeTool === "pencil" || activeTool === "brush") && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-8 px-2 flex items-center space-x-1" 
              aria-label="Select size"
            >
              <div 
                className="rounded-full bg-foreground" 
                style={{ 
                  width: `${getSizeInPixels(penSize)}px`, 
                  height: `${getSizeInPixels(penSize)}px` 
                }} 
              />
              <span className="text-xs">Size</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {sizeOptions.map(size => (
              <DropdownMenuItem 
                key={size.value}
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setPenSize(size.value)}
              >
                <div 
                  className="rounded-full bg-foreground" 
                  style={{ 
                    width: `${getSizeInPixels(size.value)}px`, 
                    height: `${getSizeInPixels(size.value)}px` 
                  }} 
                />
                <span>{size.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      
      {/* Shape Selector */}
      {activeTool === "shape" && <ShapeSelector />}
      
      <Separator orientation="vertical" className="h-8" />
      
      {/* Undo/Redo */}
      <UndoRedoButtons />
    </div>
  );
}
