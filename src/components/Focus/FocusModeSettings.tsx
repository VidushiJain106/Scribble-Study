import React from 'react';
import { useFocusStore } from '@/lib/focusStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { BellOff, MicOff, Clock, TimerOff } from 'lucide-react';

interface FocusModeSettingsProps {
  id: string | null;
  onClose: () => void;
}

export const FocusModeSettings: React.FC<FocusModeSettingsProps> = ({ id, onClose }) => {
  const { focusModes, updateFocusMode } = useFocusStore();
  const focusMode = id ? focusModes.find((mode) => mode.id === id) : null;
  
  if (!id || !focusMode) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    updateFocusMode(id, { [field]: value });
  };

  const colorOptions = [
    '#8b5cf6', // Purple
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#ef4444', // Red
    '#ec4899', // Pink
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 text-slate-200">
      <DialogHeader className="border-b border-slate-700 pb-4">
        <DialogTitle className="text-white">Focus Mode Settings</DialogTitle>
      </DialogHeader>
      
      <div className="py-4 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-300">Focus Mode Name</Label>
          <Input
            id="name"
            value={focusMode.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter a name for this focus mode"
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
        
        <div className="space-y-2">
          <Label className="text-slate-300">Focus Color</Label>
          <div className="flex gap-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-8 h-8 rounded-full ${
                  focusMode.color === color ? 'ring-2 ring-offset-2 ring-indigo-500 ring-offset-slate-900' : ''
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleInputChange('color', color)}
              />
            ))}
          </div>
        </div>
        
        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BellOff className="h-4 w-4 text-indigo-400" />
              <Label htmlFor="muteNotifications" className="cursor-pointer text-slate-300">
                Mute Notifications
              </Label>
            </div>
            <Switch
              id="muteNotifications"
              checked={focusMode.muteNotifications}
              onCheckedChange={(checked) => handleInputChange('muteNotifications', checked)}
              className="data-[state=checked]:bg-indigo-600"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MicOff className="h-4 w-4 text-blue-400" />
              <Label htmlFor="muteCalls" className="cursor-pointer text-slate-300">
                Mute Calls
              </Label>
            </div>
            <Switch
              id="muteCalls"
              checked={focusMode.muteCalls}
              onCheckedChange={(checked) => handleInputChange('muteCalls', checked)}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TimerOff className="h-4 w-4 text-violet-400" />
              <Label htmlFor="blockEntertainmentApps" className="cursor-pointer text-slate-300">
                Block Entertainment Apps
              </Label>
            </div>
            <Switch
              id="blockEntertainmentApps"
              checked={focusMode.blockEntertainmentApps}
              onCheckedChange={(checked) => handleInputChange('blockEntertainmentApps', checked)}
              className="data-[state=checked]:bg-violet-600"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <Label htmlFor="blockAllApps" className="cursor-pointer text-slate-300">
                Block All Apps
              </Label>
            </div>
            <Switch
              id="blockAllApps"
              checked={focusMode.blockAllApps}
              onCheckedChange={(checked) => handleInputChange('blockAllApps', checked)}
              className="data-[state=checked]:bg-slate-600"
            />
          </div>
        </div>
        
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="duration" className="text-slate-300">Duration: {focusMode.duration} minutes</Label>
          </div>
          <Slider
            id="duration"
            min={5}
            max={180}
            step={5}
            value={[focusMode.duration]}
            onValueChange={(value) => handleInputChange('duration', value[0])}
            className="[&_[role=slider]]:bg-indigo-500"
          />
          <div className="flex justify-between text-xs text-slate-500 pt-1">
            <span>5 min</span>
            <span>3 hours</span>
          </div>
        </div>
      </div>
      
      <DialogFooter className="border-t border-slate-700 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
          Cancel
        </Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Save Changes</Button>
      </DialogFooter>
    </form>
  );
};
