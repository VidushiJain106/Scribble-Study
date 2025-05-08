
import React, { useState } from 'react';
import { FocusModeSettings } from '@/components/Focus/FocusModeSettings';
import { FocusModeList } from '@/components/Focus/FocusModeList';
import { useFocusStore } from '@/lib/focusStore';
import { SidebarProvider, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Plus, Menu, Zap, Lightbulb } from 'lucide-react';
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
      <div className="min-h-screen flex w-full relative bg-gradient-to-b from-background to-purple-50 dark:from-background dark:to-slate-900">
        <Sidebar />
        <FloatingSidebarTrigger />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-note-purple to-note-blue p-3 rounded-full">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-note-purple to-purple-400">Focus Mode</h1>
            </div>
            <Button onClick={handleCreateFocusMode} className="flex items-center gap-2 bg-gradient-to-r from-note-purple to-purple-500 hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" />
              <span>Create Focus</span>
            </Button>
          </div>

          <div className="mb-8 p-8 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-pattern opacity-10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="h-8 w-8 text-white" />
                <h2 className="text-3xl font-bold text-white">Level Up Your Focus</h2>
              </div>
              <p className="text-white/90 text-lg max-w-lg">
                Create custom focus modes to block distractions and boost your productivity.
                Perfect for studying, gaming, or just chilling without interruptions.
              </p>
            </div>
            
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute top-4 right-8 w-20 h-20 bg-white/10 rounded-full blur-lg"></div>
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
