import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Sparkles, Wand2, Languages, MessageSquare, FileText, 
  Loader2, Check, Copy, RefreshCw
} from 'lucide-react';

interface AIAssistantButtonProps {
  text?: string;
  onResult?: (result: string) => void;
  context?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'icon';
}

type AIAction = 'compose' | 'improve' | 'change_tone' | 'translate' | 'summarize' | 'generate_reply';

const actions = [
  { id: 'compose', label: 'Compose Message', icon: MessageSquare, needsInput: true },
  { id: 'improve', label: 'Improve Writing', icon: Wand2, needsInput: false },
  { id: 'change_tone', label: 'Change Tone', icon: RefreshCw, needsInput: false },
  { id: 'translate', label: 'Translate', icon: Languages, needsInput: false },
  { id: 'summarize', label: 'Summarize', icon: FileText, needsInput: false },
  { id: 'generate_reply', label: 'Generate Reply', icon: MessageSquare, needsInput: false },
] as const;

const tones = [
  'professional', 'friendly', 'formal', 'casual', 'urgent', 'empathetic'
];

const languages = [
  'Spanish', 'French', 'German', 'Portuguese', 'Hindi', 'Chinese', 'Japanese', 'Arabic'
];

export function AIAssistantButton({ 
  text, 
  onResult, 
  context,
  variant = 'outline',
  size = 'sm'
}: AIAssistantButtonProps) {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<AIAction | null>(null);
  const [inputText, setInputText] = useState(text || '');
  const [tone, setTone] = useState('professional');
  const [language, setLanguage] = useState('Spanish');
  const [result, setResult] = useState('');

  const aiMutation = useMutation({
    mutationFn: async ({ action, content, options }: { 
      action: string; 
      content: string; 
      options?: Record<string, string>;
    }) => {
      const { data, error } = await supabase.functions.invoke('ai-communication-assistant', {
        body: {
          action,
          content,
          options,
          userId: profile?.id,
          organizationId: profile?.organization_id,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setResult(data.result);
      toast.success('AI generated response!');
    },
    onError: (error) => {
      console.error('AI Assistant error:', error);
      toast.error('Failed to generate. Please try again.');
    },
  });

  const handleAction = (action: AIAction) => {
    setSelectedAction(action);
    setResult('');
    
    const actionConfig = actions.find(a => a.id === action);
    if (!actionConfig?.needsInput && (text || inputText)) {
      executeAction(action);
    }
  };

  const executeAction = (action?: AIAction) => {
    const currentAction = action || selectedAction;
    if (!currentAction) return;

    const content = inputText || text || '';
    if (!content.trim()) {
      toast.error('Please provide some text');
      return;
    }

    let options: Record<string, string> = {};
    if (currentAction === 'change_tone') {
      options.tone = tone;
    } else if (currentAction === 'translate') {
      options.targetLanguage = language;
    } else if (currentAction === 'compose') {
      options.context = context || '';
    }

    aiMutation.mutate({ action: currentAction, content, options });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    toast.success('Copied to clipboard');
  };

  const handleApply = () => {
    if (onResult && result) {
      onResult(result);
      setIsOpen(false);
      setResult('');
      setSelectedAction(null);
    }
  };

  const resetState = () => {
    setSelectedAction(null);
    setResult('');
    if (!text) setInputText('');
  };

  return (
    <Popover open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetState();
    }}>
      <PopoverTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Sparkles className="h-4 w-4" />
          {size !== 'icon' && 'AI Assist'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        {!selectedAction ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h4 className="font-semibold">AI Assistant</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {actions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  className="h-auto py-3 flex flex-col items-center gap-1 text-xs"
                  onClick={() => handleAction(action.id as AIAction)}
                  disabled={!action.needsInput && !text && !inputText}
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </div>
            {!text && (
              <div className="space-y-2 pt-2 border-t">
                <Label className="text-xs">Or enter text to work with:</Label>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste or type your text here..."
                  rows={3}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="gap-1">
                {actions.find(a => a.id === selectedAction)?.label}
              </Badge>
              <Button variant="ghost" size="sm" onClick={resetState}>
                Back
              </Button>
            </div>

            {selectedAction === 'compose' && (
              <div className="space-y-2">
                <Label>What should I write?</Label>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Describe what you want to compose..."
                  rows={3}
                />
              </div>
            )}

            {selectedAction === 'change_tone' && (
              <div className="space-y-2">
                <Label>Select tone:</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map(t => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedAction === 'translate' && (
              <div className="space-y-2">
                <Label>Translate to:</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(l => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {!result && (
              <Button 
                className="w-full" 
                onClick={() => executeAction()}
                disabled={aiMutation.isPending}
              >
                {aiMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            )}

            {result && (
              <div className="space-y-3">
                <div className="bg-muted p-3 rounded-lg text-sm max-h-48 overflow-y-auto">
                  <p className="whitespace-pre-wrap">{result}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  {onResult && (
                    <Button size="sm" className="flex-1" onClick={handleApply}>
                      <Check className="h-4 w-4 mr-2" />
                      Apply
                    </Button>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => executeAction()}
                  disabled={aiMutation.isPending}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
