
import { Editor } from '@tiptap/react';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';

interface EditorColorMenuProps {
  editor: Editor;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function EditorColorMenu({ editor, isOpen, setIsOpen }: EditorColorMenuProps) {
  // Define text colors
  const textColors = [
    { name: 'Black', value: '#000000' },
    { name: 'Dark Gray', value: '#333333' },
    { name: 'Gray', value: '#666666' },
    { name: 'Light Gray', value: '#999999' },
    { name: 'Primary Purple', value: '#9b87f5' },
    { name: 'Blue', value: '#0ea5e9' },
    { name: 'Green', value: '#10b981' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'White', value: '#ffffff' },
  ];

  // Define highlight colors
  const highlightColors = [
    { name: 'Yellow', value: '#fff9c2' },
    { name: 'Green', value: '#c2f5d0' },
    { name: 'Blue', value: '#c2e2f5' },
    { name: 'Pink', value: '#f5c2e2' },
    { name: 'Orange', value: '#f5d8c2' },
    { name: 'Purple', value: '#e2c2f5' },
    { name: 'Gray', value: '#e2e2e2' },
  ];

  const setTextColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  const setHighlight = (color: string) => {
    editor.chain().focus().toggleHighlight({ color }).run();
  };

  const removeColor = () => {
    editor.chain().focus().unsetColor().run();
  };

  const removeHighlight = () => {
    editor.chain().focus().unsetHighlight().run();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverContent className="w-64 p-3">
        <Tabs defaultValue="text">
          <TabsList className="grid grid-cols-2 mb-3">
            <TabsTrigger value="text">Text Color</TabsTrigger>
            <TabsTrigger value="highlight">Highlight</TabsTrigger>
          </TabsList>
          <TabsContent value="text">
            <div className="space-y-2">
              <Label className="text-sm">Select text color</Label>
              <div className="grid grid-cols-4 gap-2">
                {textColors.map((color) => (
                  <button
                    key={color.value}
                    className="w-10 h-10 rounded border border-gray-200 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
                    style={{ backgroundColor: color.value }}
                    aria-label={`Text color: ${color.name}`}
                    onClick={() => {
                      setTextColor(color.value);
                      setIsOpen(false);
                    }}
                  />
                ))}
                <button
                  className="w-10 h-10 rounded border border-gray-200 flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                  aria-label="Reset text color"
                  onClick={() => {
                    removeColor();
                    setIsOpen(false);
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="highlight">
            <div className="space-y-2">
              <Label className="text-sm">Select highlight color</Label>
              <div className="grid grid-cols-4 gap-2">
                {highlightColors.map((color) => (
                  <button
                    key={color.value}
                    className="w-10 h-10 rounded border border-gray-200 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
                    style={{ backgroundColor: color.value }}
                    aria-label={`Highlight color: ${color.name}`}
                    onClick={() => {
                      setHighlight(color.value);
                      setIsOpen(false);
                    }}
                  />
                ))}
                <button
                  className="w-10 h-10 rounded border border-gray-200 flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary text-xs"
                  aria-label="Remove highlight"
                  onClick={() => {
                    removeHighlight();
                    setIsOpen(false);
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
