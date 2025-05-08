
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
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Focus Mode Settings</DialogTitle>
      </DialogHeader>
      
      <div className="py-4 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Focus Mode Name</Label>
          <Input
            id="name"
            value={focusMode.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter a name for this focus mode"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Focus Color</Label>
          <div className="flex gap-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-8 h-8 rounded-full ${
                  focusMode.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
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
              <BellOff className="h-4 w-4" />
              <Label htmlFor="muteNotifications" className="cursor-pointer">
                Mute Notifications
              </Label>
            </div>
            <Switch
              id="muteNotifications"
              checked={focusMode.muteNotifications}
              onCheckedChange={(checked) => handleInputChange('muteNotifications', checked)}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MicOff className="h-4 w-4" />
              <Label htmlFor="muteCalls" className="cursor-pointer">
                Mute Calls
              </Label>
            </div>
            <Switch
              id="muteCalls"
              checked={focusMode.muteCalls}
              onCheckedChange={(checked) => handleInputChange('muteCalls', checked)}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TimerOff className="h-4 w-4" />
              <Label htmlFor="blockEntertainmentApps" className="cursor-pointer">
                Block Entertainment Apps
              </Label>
            </div>
            <Switch
              id="blockEntertainmentApps"
              checked={focusMode.blockEntertainmentApps}
              onCheckedChange={(checked) => handleInputChange('blockEntertainmentApps', checked)}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <Label htmlFor="blockAllApps" className="cursor-pointer">
                Block All Apps
              </Label>
            </div>
            <Switch
              id="blockAllApps"
              checked={focusMode.blockAllApps}
              onCheckedChange={(checked) => handleInputChange('blockAllApps', checked)}
            />
          </div>
        </div>
        
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="duration">Duration: {focusMode.duration} minutes</Label>
          </div>
          <Slider
            id="duration"
            min={5}
            max={180}
            step={5}
            value={[focusMode.duration]}
            onValueChange={(value) => handleInputChange('duration', value[0])}
          />
          <div className="flex justify-between text-xs text-muted-foreground pt-1">
            <span>5 min</span>
            <span>3 hours</span>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  );
};
