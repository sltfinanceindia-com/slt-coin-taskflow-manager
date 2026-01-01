import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  category: string;
  action: () => void;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  onNewTask?: () => void;
  onSearch?: () => void;
  onHelp?: () => void;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { enabled = true, onNewTask, onSearch, onHelp } = options;
  const navigate = useNavigate();

  const shortcuts: KeyboardShortcut[] = [
    // Navigation
    { key: 'd', description: 'Go to Dashboard', category: 'Navigation', action: () => navigate('/dashboard') },
    { key: 't', description: 'Go to Tasks', category: 'Navigation', action: () => navigate('/tasks') },
    { key: 'p', description: 'Go to Projects', category: 'Navigation', action: () => navigate('/projects') },
    { key: 'c', description: 'Go to Calendar', category: 'Navigation', action: () => navigate('/calendar') },
    { key: 'm', description: 'Go to Messages', category: 'Navigation', action: () => navigate('/messages') },
    
    // Actions
    { key: 'n', description: 'New Task', category: 'Actions', action: () => onNewTask?.() },
    { key: 'k', ctrl: true, description: 'Open Search', category: 'Actions', action: () => onSearch?.() },
    { key: 'k', meta: true, description: 'Open Search', category: 'Actions', action: () => onSearch?.() },
    { key: '/', description: 'Show Shortcuts', category: 'Actions', action: () => onHelp?.() },
    { key: '?', shift: true, description: 'Show Shortcuts', category: 'Actions', action: () => onHelp?.() },
    
    // General
    { key: 'Escape', description: 'Close Dialog/Modal', category: 'General', action: () => {
      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      document.dispatchEvent(event);
    }},
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    const isInputField = target.tagName === 'INPUT' || 
                         target.tagName === 'TEXTAREA' || 
                         target.isContentEditable ||
                         target.closest('[role="textbox"]');
    
    // Allow Cmd/Ctrl+K even in input fields for search
    const isSearchShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
    
    if (isInputField && !isSearchShortcut) return;

    for (const shortcut of shortcuts) {
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase() || 
                       event.key === shortcut.key;
      const ctrlMatch = !shortcut.ctrl || event.ctrlKey;
      const metaMatch = !shortcut.meta || event.metaKey;
      const shiftMatch = !shortcut.shift || event.shiftKey;
      const altMatch = !shortcut.alt || event.altKey;
      
      // For shortcuts without modifiers, make sure no modifiers are pressed
      const noModifiersRequired = !shortcut.ctrl && !shortcut.meta && !shortcut.shift && !shortcut.alt;
      const noModifiersPressed = !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
      
      const modifiersMatch = noModifiersRequired 
        ? noModifiersPressed 
        : (ctrlMatch && metaMatch && shiftMatch && altMatch);

      if (keyMatch && modifiersMatch) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    if (!enabled) return;
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  return { shortcuts };
}

// Get formatted shortcut key for display
export function formatShortcutKey(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.meta) parts.push('⌘');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  
  const key = shortcut.key === ' ' ? 'Space' : shortcut.key.toUpperCase();
  parts.push(key);
  
  return parts.join(' + ');
}