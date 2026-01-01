import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Kbd } from '@/components/ui/kbd';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutCategory {
  name: string;
  shortcuts: ShortcutItem[];
}

const shortcutCategories: ShortcutCategory[] = [
  {
    name: 'Navigation',
    shortcuts: [
      { keys: ['D'], description: 'Go to Dashboard' },
      { keys: ['T'], description: 'Go to Tasks' },
      { keys: ['P'], description: 'Go to Projects' },
      { keys: ['C'], description: 'Go to Calendar' },
      { keys: ['M'], description: 'Go to Messages' },
    ],
  },
  {
    name: 'Actions',
    shortcuts: [
      { keys: ['N'], description: 'Create new task' },
      { keys: ['⌘', 'K'], description: 'Open search' },
      { keys: ['/', '?'], description: 'Show keyboard shortcuts' },
    ],
  },
  {
    name: 'General',
    shortcuts: [
      { keys: ['Esc'], description: 'Close dialog or modal' },
    ],
  },
];

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {shortcutCategories.map((category) => (
            <div key={category.name}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {category.name}
              </h3>
              <div className="space-y-2">
                {category.shortcuts.map((shortcut, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          <Kbd>{key}</Kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground text-xs">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Press <Kbd>?</Kbd> or <Kbd>/</Kbd> anytime to show this dialog
        </div>
      </DialogContent>
    </Dialog>
  );
}