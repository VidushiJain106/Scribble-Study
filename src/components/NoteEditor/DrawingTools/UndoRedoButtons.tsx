
import { Button } from "@/components/ui/button";
import { useNoteStore } from "@/lib/store";
import { Undo2, Redo2 } from "lucide-react";

export function UndoRedoButtons() {
  const currentPaths = useNoteStore(state => state.currentPaths);
  const undoDrawing = useNoteStore(state => state.undoDrawing);
  const redoDrawing = useNoteStore(state => state.redoDrawing);
  
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        disabled={currentPaths.length === 0}
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
        disabled={true} // For now, since we don't have redo functionality yet
        aria-label="Redo"
      >
        <Redo2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
