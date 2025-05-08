import React, { useState } from 'react';
import { FocusModeSettings } from '@/components/Focus/FocusModeSettings';
import { FocusModeList } from '@/components/Focus/FocusModeList';
import { useFocusStore } from '@/lib/focusStore';
import { SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus, Menu } from 'lucide-react';
import { Sidebar } from '@/components/Dashboard/Sidebar';

const FloatingSidebarTrigger = () => {
  const { open } = useSidebar();

  if (open) return null;

  return (
    <div className="absolute top-4 left-4 z-10">
      <SidebarTrigger className="bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-sm">
        <Menu className="h-5 w-5" />
      </SidebarTrigger>
    </div>
  );
};

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
      <div className="min-h-screen flex w-full relative">
        <Sidebar />
        <FloatingSidebarTrigger />
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
