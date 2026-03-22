import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

interface ForwardTarget {
  id: string;
  name: string;
  avatar_url?: string;
  type: 'user' | 'channel';
}

interface ForwardMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: {
    id: string;
    content: string;
  } | null;
  targets: ForwardTarget[];
  onForward: (targetIds: string[]) => Promise<void>;
}

export default function ForwardMessageDialog({
  open,
  onOpenChange,
  message,
  targets,
  onForward
}: ForwardMessageDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTargets, setSelectedTargets] = useState<Set<string>>(new Set());
  const [isForwarding, setIsForwarding] = useState(false);

  const filteredTargets = targets.filter(target =>
    target.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTarget = (id: string) => {
    setSelectedTargets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleForward = async () => {
    if (selectedTargets.size === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    setIsForwarding(true);
    try {
      await onForward(Array.from(selectedTargets));
      setSelectedTargets(new Set());
    } catch (error) {
      toast.error('Failed to forward message');
    } finally {
      setIsForwarding(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Forward Message</DialogTitle>
          <DialogDescription>
            Select one or more recipients to forward this message to
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users or channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Target List */}
        <ScrollArea className="h-64 pr-4">
          <div className="space-y-2">
            {filteredTargets.map(target => (
              <div
                key={target.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                onClick={() => toggleTarget(target.id)}
              >
                <Checkbox
                  checked={selectedTargets.has(target.id)}
                  onCheckedChange={() => toggleTarget(target.id)}
                />
                
                <Avatar className="h-9 w-9">
                  <AvatarImage src={target.avatar_url} />
                  <AvatarFallback className="text-sm">
                    {getInitials(target.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{target.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {target.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleForward}
            disabled={selectedTargets.size === 0 || isForwarding}
          >
            {isForwarding ? 'Forwarding...' : `Forward to ${selectedTargets.size || ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
