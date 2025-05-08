
import { Editor } from '@tiptap/react';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface EditorTableMenuProps {
  editor: Editor;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function EditorTableMenu({ editor, isOpen, setIsOpen }: EditorTableMenuProps) {
  const [rows, setRows] = useState('3');
  const [cols, setCols] = useState('3');

  const createTable = () => {
    const rowsNum = parseInt(rows, 10) || 3;
    const colsNum = parseInt(cols, 10) || 3;
    
    editor.chain().focus().insertTable({ rows: rowsNum, cols: colsNum, withHeaderRow: true }).run();
    setIsOpen(false);
  };

  const isTableActive = editor.isActive('table');

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverContent className="w-80 p-4">
        {!isTableActive ? (
          <div className="grid gap-4">
            <h3 className="text-sm font-medium">Insert Table</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-1.5">
                <Label htmlFor="rows">Rows</Label>
                <Input
                  id="rows"
                  type="number"
                  min="1"
                  max="20"
                  className="h-8"
                  value={rows}
                  onChange={(e) => setRows(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cols">Columns</Label>
                <Input
                  id="cols"
                  type="number"
                  min="1"
                  max="10"
                  className="h-8"
                  value={cols}
                  onChange={(e) => setCols(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={createTable}>Create Table</Button>
          </div>
        ) : (
          <div className="grid gap-3">
            <h3 className="text-sm font-medium">Table Options</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              disabled={!editor.can().addColumnBefore()}
            >
              Add Column Before
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              disabled={!editor.can().addColumnAfter()}
            >
              Add Column After
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              disabled={!editor.can().deleteColumn()}
            >
              Delete Column
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => editor.chain().focus().addRowBefore().run()}
              disabled={!editor.can().addRowBefore()}
            >
              Add Row Before
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              disabled={!editor.can().addRowAfter()}
            >
              Add Row After
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => editor.chain().focus().deleteRow().run()}
              disabled={!editor.can().deleteRow()}
            >
              Delete Row
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => editor.chain().focus().deleteTable().run()}
              disabled={!editor.can().deleteTable()}
            >
              Delete Table
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => editor.chain().focus().mergeCells().run()}
              disabled={!editor.can().mergeCells()}
            >
              Merge Cells
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => editor.chain().focus().splitCell().run()}
              disabled={!editor.can().splitCell()}
            >
              Split Cell
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => editor.chain().focus().toggleHeaderRow().run()}
              disabled={!editor.can().toggleHeaderRow()}
            >
              Toggle Header Row
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
              disabled={!editor.can().toggleHeaderColumn()}
            >
              Toggle Header Column
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
