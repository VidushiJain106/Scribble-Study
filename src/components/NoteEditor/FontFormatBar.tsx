import React from "react";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, ListOrdered, List,
// Changed from ListUnordered to List
Heading, Text // Changed from FontSize to Text
} from "lucide-react";
interface FontFormatBarProps {
  onFormatChange: (formatType: string, value: any) => void;
}
export function FontFormatBar({
  onFormatChange
}: FontFormatBarProps) {
  const fontSizes = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"];
  const fontFamilies = [{
    name: "Default",
    value: "Inter, system-ui, sans-serif"
  }, {
    name: "Serif",
    value: "Georgia, serif"
  }, {
    name: "Monospace",
    value: "monospace"
  }];
  const fontColors = [{
    name: "Black",
    value: "#000000"
  }, {
    name: "Dark Gray",
    value: "#333333"
  }, {
    name: "Gray",
    value: "#666666"
  }, {
    name: "Light Gray",
    value: "#999999"
  }, {
    name: "Primary Purple",
    value: "#9b87f5"
  }, {
    name: "Blue",
    value: "#0ea5e9"
  }, {
    name: "Green",
    value: "#10b981"
  }, {
    name: "Red",
    value: "#ef4444"
  }, {
    name: "Orange",
    value: "#f97316"
  }, {
    name: "Yellow",
    value: "#eab308"
  }];
  return <div className="bg-background border p-1 flex flex-wrap gap-1 mb-2 items-center rounded-sm">
      {/* Text style toggles */}
      <ToggleGroup type="multiple" className="flex-wrap">
        <ToggleGroupItem value="bold" size="sm" onClick={() => onFormatChange("fontWeight", "bold")}>
          <Bold className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" size="sm" onClick={() => onFormatChange("fontStyle", "italic")}>
          <Italic className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" size="sm" onClick={() => onFormatChange("textDecoration", "underline")}>
          <Underline className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="strikethrough" size="sm" onClick={() => onFormatChange("textDecoration", "line-through")}>
          <Strikethrough className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Text alignment */}
      <ToggleGroup type="single" defaultValue="left">
        <ToggleGroupItem value="left" size="sm" onClick={() => onFormatChange("textAlign", "left")}>
          <AlignLeft className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" size="sm" onClick={() => onFormatChange("textAlign", "center")}>
          <AlignCenter className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" size="sm" onClick={() => onFormatChange("textAlign", "right")}>
          <AlignRight className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <Separator orientation="vertical" className="mx-1 h-6" />
      
      {/* List formatting */}
      <Toggle size="sm" onClick={() => onFormatChange("list", "ordered")}>
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      <Toggle size="sm" onClick={() => onFormatChange("list", "unordered")}>
        <List className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-6" />
      
      {/* Font size */}
      <Popover>
        <PopoverTrigger asChild>
          <Toggle size="sm" className="gap-1">
            <Text className="h-4 w-4" />
            <span className="sr-only">Font size</span>
          </Toggle>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="grid gap-2">
            <p className="text-sm font-medium">Font Size</p>
            <Select onValueChange={value => onFormatChange("fontSize", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {fontSizes.map(size => <SelectItem key={size} value={size}>{size}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Heading */}
      <Popover>
        <PopoverTrigger asChild>
          <Toggle size="sm" className="gap-1">
            <Heading className="h-4 w-4" />
            <span className="sr-only">Heading</span>
          </Toggle>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="grid gap-2">
            <p className="text-sm font-medium">Heading Level</p>
            <Select onValueChange={value => onFormatChange("heading", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select heading" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="h1">Heading 1</SelectItem>
                <SelectItem value="h2">Heading 2</SelectItem>
                <SelectItem value="h3">Heading 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Font family */}
      <Popover>
        <PopoverTrigger asChild>
          <Toggle size="sm" className="gap-1 px-2">
            <span className="text-xs">Font</span>
          </Toggle>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="grid gap-2">
            <p className="text-sm font-medium">Font Family</p>
            <Select onValueChange={value => onFormatChange("fontFamily", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map(font => <SelectItem key={font.name} value={font.value}>{font.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Font color */}
      <Popover>
        <PopoverTrigger asChild>
          <Toggle size="sm" className="gap-1 px-2">
            <span className="h-3 w-3 rounded-full bg-foreground" />
            <span className="sr-only">Text color</span>
          </Toggle>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="grid gap-2">
            <p className="text-sm font-medium">Text Color</p>
            <div className="grid grid-cols-5 gap-2">
              {fontColors.map(color => <div key={color.value} className="h-6 w-6 rounded-md cursor-pointer border" style={{
              backgroundColor: color.value
            }} onClick={() => onFormatChange("color", color.value)} title={color.name} />)}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>;
}