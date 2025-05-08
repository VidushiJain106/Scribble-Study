import React from 'react';
import { useFocusStore } from '@/lib/focusStore';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, BellOff, MicOff, TimerOff, Play, Pause, Edit, Trash2, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { FocusMode } from '@/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
      <div className="text-center p-12 bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-700">
        <Zap className="h-12 w-12 mx-auto mb-4 text-indigo-400 opacity-70" />
        <h3 className="text-xl font-bold mb-2 text-white">No Focus Modes Yet!</h3>
        <p className="text-slate-400">Create your first focus mode to start blocking distractions.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {focusModes.map((mode) => (
        <Card 
          key={mode.id} 
          className={`overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-slate-800 ${
            mode.id === activeFocusMode 
              ? 'shadow-lg shadow-indigo-900/50 border-2 border-indigo-500' 
              : 'border border-slate-700'
          }`}
        >
          <div className="h-2.5" style={{ backgroundColor: mode.color }} />
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-bold text-white">{mode.name}</CardTitle>
              <Switch 
                checked={mode.id === activeFocusMode}
                onCheckedChange={() => handleToggleFocusMode(mode)}
                className="data-[state=checked]:bg-indigo-600"
              />
            </div>
            <div className="flex items-center text-sm text-slate-400 gap-1 mt-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{mode.duration} min</span>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full flex justify-between items-center py-1 mt-2 text-xs text-slate-300 hover:bg-slate-700">
                  <span>Focus settings</span>
                  <span className="text-xs">▼</span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="flex flex-wrap gap-2 mb-4 mt-2">
                  {mode.muteNotifications && (
                    <Badge variant="outline" className="bg-indigo-900/30 border-indigo-700 text-indigo-300 flex items-center gap-1 py-1">
                      <BellOff className="h-3 w-3" />
                      <span>No notifications</span>
                    </Badge>
                  )}
                  {mode.muteCalls && (
                    <Badge variant="outline" className="bg-blue-900/30 border-blue-700 text-blue-300 flex items-center gap-1 py-1">
                      <MicOff className="h-3 w-3" />
                      <span>No calls</span>
                    </Badge>
                  )}
                  {mode.blockEntertainmentApps && (
                    <Badge variant="outline" className="bg-violet-900/30 border-violet-700 text-violet-300 flex items-center gap-1 py-1">
                      <TimerOff className="h-3 w-3" />
                      <span>Block fun apps</span>
                    </Badge>
                  )}
                  {mode.blockAllApps && (
                    <Badge variant="outline" className="bg-slate-900/50 border-slate-700 text-slate-300 flex items-center gap-1 py-1">
                      <Clock className="h-3 w-3" />
                      <span>Block all apps</span>
                    </Badge>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
          <CardFooter className="flex justify-between items-center pt-2 border-t border-slate-700">
            <Button 
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:bg-slate-700"
              onClick={() => onEdit(mode.id)}
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>

            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 rounded-full text-red-400 hover:bg-red-900/20"
                onClick={() => deleteFocusMode(mode.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
              <Button 
                size="icon"
                variant="ghost"
                className={`h-8 w-8 rounded-full ${
                  mode.id === activeFocusMode
                    ? 'bg-indigo-900/50 text-indigo-300'
                    : 'hover:bg-slate-700 text-slate-300'
                }`}
                onClick={() => handleToggleFocusMode(mode)}
              >
                {mode.id === activeFocusMode ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
