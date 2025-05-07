import { Button } from "@/components/ui/button";
import { useDrawingStore } from "@/lib/drawingStore";
import { Undo2, Redo2 } from "lucide-react";

export function UndoRedoButtons() {
  const paths = useDrawingStore(state => state.currentPaths);
  const undoDrawing = useDrawingStore(state => state.undoDrawing);
  const redoDrawing = useDrawingStore(state => state.redoDrawing);
  
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        disabled={paths.length === 0}
        onClick={undoDrawing}
        aria-label="Undo"
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={redoDrawing}
        disabled={true} // Still disabled until we implement full redo functionality
        aria-label="Redo"
      >
        <Redo2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
