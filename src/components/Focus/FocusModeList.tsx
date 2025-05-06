
import React from 'react';
import { useFocusStore } from '@/lib/focusStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, BellOff, MicOff, TimerOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { FocusMode } from '@/types';

interface FocusModeListProps {
  onEdit: (id: string) => void;
}

export const FocusModeList: React.FC<FocusModeListProps> = ({ onEdit }) => {
  const { focusModes, activeFocusMode, activateFocusMode, deactivateFocusMode, deleteFocusMode } = useFocusStore();

  const handleToggleFocusMode = (mode: FocusMode) => {
    if (activeFocusMode === mode.id) {
      deactivateFocusMode();
    } else {
      activateFocusMode(mode.id);
    }
  };

  if (focusModes.length === 0) {
    return (
      <div className="text-center p-8">
        <h3 className="text-lg font-medium mb-2">No Focus Modes</h3>
        <p className="text-muted-foreground">Create your first focus mode to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {focusModes.map((mode) => (
        <Card key={mode.id} className={`overflow-hidden ${mode.isActive ? 'ring-2 ring-primary' : ''}`}>
          <div className="h-2" style={{ backgroundColor: mode.color }} />
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>{mode.name}</CardTitle>
              <Switch 
                checked={mode.id === activeFocusMode}
                onCheckedChange={() => handleToggleFocusMode(mode)}
              />
            </div>
            <CardDescription>
              {mode.duration} minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex flex-wrap gap-2 mb-4">
              {mode.muteNotifications && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <BellOff className="h-3 w-3" />
                  <span>Mute notifications</span>
                </Badge>
              )}
              {mode.muteCalls && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <MicOff className="h-3 w-3" />
                  <span>Mute calls</span>
                </Badge>
              )}
              {mode.blockEntertainmentApps && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <TimerOff className="h-3 w-3" />
                  <span>Block entertainment</span>
                </Badge>
              )}
              {mode.blockAllApps && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Block all apps</span>
                </Badge>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(mode.id)}>
              Edit
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => deleteFocusMode(mode.id)}
            >
              Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
