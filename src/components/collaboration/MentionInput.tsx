/**
 * Mention Input
 * Rich input with @mention autocomplete
 */

import { useState, useRef, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

interface UserSuggestion {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

export function MentionInput({
  value,
  onChange,
  placeholder = 'Type a message...',
  className,
  disabled = false,
}: MentionInputProps) {
  const { profile } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionPosition, setMentionPosition] = useState(0);

  // Fetch users for mentions
  const { data: users = [] } = useQuery({
    queryKey: ['mention-users', profile?.organization_id, mentionSearch],
    queryFn: async () => {
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .eq('organization_id', profile.organization_id)
        .neq('id', profile.id) // Exclude self
        .limit(10);

      if (mentionSearch) {
        query = query.ilike('full_name', `%${mentionSearch}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as UserSuggestion[];
    },
    enabled: !!profile?.organization_id && showMentions,
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    // Check if we're in a mention context
    const textBeforeCursor = newValue.slice(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionSearch(mentionMatch[1]);
      setMentionPosition(mentionMatch.index || 0);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }

    onChange(newValue);
  }, [onChange]);

  const handleSelectUser = useCallback((user: UserSuggestion) => {
    // Replace the @mention with the formatted mention
    const beforeMention = value.slice(0, mentionPosition);
    const afterMention = value.slice(mentionPosition + mentionSearch.length + 1);
    const newValue = `${beforeMention}@${user.full_name} ${afterMention}`;
    
    onChange(newValue);
    setShowMentions(false);
    setMentionSearch('');
    
    // Focus back to textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [value, mentionPosition, mentionSearch, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (showMentions && (e.key === 'Escape' || e.key === 'Tab')) {
      setShowMentions(false);
      e.preventDefault();
    }
  }, [showMentions]);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("resize-none", className)}
      />
      {showMentions && users.length > 0 && (
        <div className="absolute z-50 w-64 mt-1 rounded-md border bg-popover shadow-md">
          <Command>
            <CommandList>
              <CommandEmpty>No users found</CommandEmpty>
              <CommandGroup heading="Suggestions">
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.full_name}
                    onSelect={() => handleSelectUser(user)}
                    className="cursor-pointer"
                  >
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarFallback className="text-xs">
                        {user.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
