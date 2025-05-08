
import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Toggle } from '@/components/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { 
  Bold, Italic, Underline, Strikethrough, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, 
  Heading, Heading1, Heading2, Heading3,
  Table, Link, Image, 
  Type, Palette
} from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EditorToolbarProps {
  editor: Editor;
  setIsTableMenuOpen: (open: boolean) => void;
  setIsColorMenuOpen: (open: boolean) => void;
}

export function EditorToolbar({ editor, setIsTableMenuOpen, setIsColorMenuOpen }: EditorToolbarProps) {
  const [linkUrl, setLinkUrl] = useState('https://');
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imagePopoverOpen, setImagePopoverOpen] = useState(false);

  // Font families
  const fontFamilies = [
    { name: 'Default', value: 'Inter, system-ui, sans-serif' },
    { name: 'Serif', value: 'Georgia, serif' },
    { name: 'Monospace', value: 'monospace' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' },
    { name: 'Courier New', value: 'Courier New, monospace' }
  ];

  // Font sizes (in px)
  const fontSizes = ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px', '60px', '72px'];

  const setLink = () => {
    if (linkUrl) {
      // Check if the URL has protocol
      const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
      
      // Set link
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url })
        .run();

      // Close popover and reset
      setLinkPopoverOpen(false);
      setLinkUrl('https://');
    }
  };

  const addImage = () => {
    if (imageUrl) {
      editor
        .chain()
        .focus()
        .insertImage({ src: imageUrl, alt: imageAlt || '' })
        .run();

      // Close popover and reset
      setImagePopoverOpen(false);
      setImageUrl('');
      setImageAlt('');
    }
  };

  return (
    <div className="bg-background border p-1 flex flex-wrap gap-1 mb-2 items-center rounded-sm overflow-x-auto sticky top-0 z-10">
      {/* Text style toggles */}
      <ToggleGroup type="multiple" className="flex-wrap">
        <ToggleGroupItem 
          value="bold" 
          size="sm" 
          aria-label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="italic" 
          size="sm"
          aria-label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="underline" 
          size="sm"
          aria-label="Underline"
          onClick={() => editor.chain().focus().toggleMark('underline').run()}
        >
          <Underline className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="strikethrough" 
          size="sm"
          aria-label="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Text alignment */}
      <ToggleGroup type="single" value={
          editor.isActive({ textAlign: 'left' }) ? 'left' : 
          editor.isActive({ textAlign: 'center' }) ? 'center' : 
          editor.isActive({ textAlign: 'right' }) ? 'right' :
          editor.isActive({ textAlign: 'justify' }) ? 'justify' : 'left'
      }>
        <ToggleGroupItem 
          value="left" 
          size="sm" 
          onClick={() => editor.chain().focus().setAlign('left').run()}
          aria-label="Align left"
        >
          <AlignLeft className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="center" 
          size="sm"
          onClick={() => editor.chain().focus().setAlign('center').run()}
          aria-label="Align center"
        >
          <AlignCenter className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="right" 
          size="sm"
          onClick={() => editor.chain().focus().setAlign('right').run()}
          aria-label="Align right"
        >
          <AlignRight className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="justify" 
          size="sm"
          onClick={() => editor.chain().focus().setAlign('justify').run()}
          aria-label="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <Separator orientation="vertical" className="mx-1 h-6" />
      
      {/* Lists */}
      <Toggle 
        size="sm" 
        pressed={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        aria-label="Bullet list"
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle 
        size="sm"
        pressed={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        aria-label="Ordered list"
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Headings */}
      <Popover>
        <PopoverTrigger asChild>
          <Toggle size="sm" className="gap-1" pressed={editor.isActive('heading')}>
            <Heading className="h-4 w-4" />
            <span className="sr-only">Heading</span>
          </Toggle>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="grid gap-2">
            <p className="text-sm font-medium">Heading Level</p>
            <div className="flex flex-col space-y-1">
              <Button 
                variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'outline'} 
                size="sm" 
                className="justify-start"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              >
                <Heading1 className="h-4 w-4 mr-2" />
                Heading 1
              </Button>
              <Button 
                variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'} 
                size="sm" 
                className="justify-start"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                <Heading2 className="h-4 w-4 mr-2" />
                Heading 2
              </Button>
              <Button 
                variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'outline'} 
                size="sm" 
                className="justify-start"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              >
                <Heading3 className="h-4 w-4 mr-2" />
                Heading 3
              </Button>
              <Button 
                variant={!editor.isActive('heading') ? 'default' : 'outline'} 
                size="sm" 
                className="justify-start"
                onClick={() => editor.chain().focus().setParagraph().run()}
              >
                <Type className="h-4 w-4 mr-2" />
                Normal text
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="mx-1 h-6" />
      
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
            <Select 
              onValueChange={(value) => {
                editor.chain().focus().setFontFamily(value).run();
              }}
              value={fontFamilies.find(font => editor.isActive('textStyle', { fontFamily: font.value }))?.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map(font => (
                  <SelectItem key={font.name} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Font size */}
      <Popover>
        <PopoverTrigger asChild>
          <Toggle size="sm" className="gap-1">
            <Type className="h-4 w-4" />
            <span className="sr-only">Font size</span>
          </Toggle>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="grid gap-2">
            <p className="text-sm font-medium">Font Size</p>
            <Select
              onValueChange={(value) => {
                editor.chain().focus().setFontSize(value).run();
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {fontSizes.map(size => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>

      {/* Font color */}
      <Toggle 
        size="sm" 
        className="gap-1" 
        onClick={() => setIsColorMenuOpen(true)}
        aria-label="Text color"
      >
        <Palette className="h-4 w-4" />
      </Toggle>
      
      <Separator orientation="vertical" className="mx-1 h-6" />
      
      {/* Tables */}
      <Toggle 
        size="sm"
        onClick={() => setIsTableMenuOpen(true)}
        aria-label="Insert table"
      >
        <Table className="h-4 w-4" />
      </Toggle>

      {/* Link */}
      <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
        <PopoverTrigger asChild>
          <Toggle 
            size="sm" 
            pressed={editor.isActive('link')}
            aria-label="Insert link"
          >
            <Link className="h-4 w-4" />
          </Toggle>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="link">Link URL</Label>
              <Input 
                id="link" 
                value={linkUrl} 
                onChange={(e) => setLinkUrl(e.target.value)} 
                className="col-span-2 h-8" 
              />
            </div>
            <div className="flex justify-between">
              {editor.isActive('link') && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    editor.chain().focus().unsetLink().run();
                    setLinkPopoverOpen(false);
                  }}
                >
                  Remove Link
                </Button>
              )}
              <Button size="sm" onClick={setLink} className="ml-auto">
                {editor.isActive('link') ? 'Update Link' : 'Add Link'}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Image */}
      <Popover open={imagePopoverOpen} onOpenChange={setImagePopoverOpen}>
        <PopoverTrigger asChild>
          <Toggle size="sm" aria-label="Insert image">
            <Image className="h-4 w-4" />
          </Toggle>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input 
                id="image-url" 
                value={imageUrl} 
                onChange={(e) => setImageUrl(e.target.value)} 
                className="col-span-2 h-8" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image-alt">Alt Text</Label>
              <Input 
                id="image-alt" 
                value={imageAlt} 
                onChange={(e) => setImageAlt(e.target.value)} 
                placeholder="Image description" 
                className="col-span-2 h-8" 
              />
            </div>
            <Button size="sm" onClick={addImage}>
              Add Image
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
