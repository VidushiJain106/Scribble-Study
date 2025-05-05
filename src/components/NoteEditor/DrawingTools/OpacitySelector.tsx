
import { useNoteStore } from "@/lib/store";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Droplets } from "lucide-react";

export function OpacitySelector() {
  const penOpacity = useNoteStore(state => state.penOpacity);
  const setPenOpacity = useNoteStore(state => state.setPenOpacity);
  
  const handleOpacityChange = (value: number[]) => {
    setPenOpacity(value[0]);
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          aria-label="Adjust opacity"
        >
          <Droplets className="h-4 w-4" style={{ opacity: penOpacity }} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="opacity">Opacity</Label>
            <span className="text-sm text-muted-foreground">{Math.round(penOpacity * 100)}%</span>
          </div>
          <Slider
            id="opacity"
            min={0.1}
            max={1}
            step={0.05}
            value={[penOpacity]}
            onValueChange={handleOpacityChange}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
