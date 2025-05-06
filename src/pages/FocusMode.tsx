
import React, { useState } from 'react';
import { FocusModeSidebar } from '@/components/Focus/FocusModeSidebar';
import { FocusModeSettings } from '@/components/Focus/FocusModeSettings';
import { FocusModeList } from '@/components/Focus/FocusModeList';
import { useFocusStore } from '@/lib/focusStore';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const FocusMode = () => {
  const [openSettings, setOpenSettings] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { createFocusMode } = useFocusStore();

  const handleCreateFocusMode = () => {
    const newId = createFocusMode();
    setEditingId(newId);
    setOpenSettings(true);
  };

  const handleEditFocusMode = (id: string) => {
    setEditingId(id);
    setOpenSettings(true);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <FocusModeSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Focus Mode</h1>
            <Button onClick={handleCreateFocusMode} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>New Focus Mode</span>
            </Button>
          </div>

          <div className="mb-8 p-8 bg-gradient-to-r from-note-purple to-primary rounded-lg shadow-lg text-white">
            <h2 className="text-3xl font-bold mb-2">Focus Mode</h2>
            <p className="text-white/90 max-w-md">
              Create custom focus modes to help you stay focused on what matters.
              Customize notification settings, app blocking, and time durations.
            </p>
          </div>

          <FocusModeList onEdit={handleEditFocusMode} />
          
          <Dialog open={openSettings} onOpenChange={setOpenSettings}>
            <DialogContent className="sm:max-w-[550px]">
              <FocusModeSettings 
                id={editingId} 
                onClose={() => {
                  setOpenSettings(false);
                  setEditingId(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default FocusMode;
