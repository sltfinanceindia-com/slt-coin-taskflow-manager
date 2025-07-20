
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TaskDescriptionProps {
  description: string;
  title?: string;
}

export function TaskDescription({ description, title = "Description" }: TaskDescriptionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-between p-3 h-auto bg-gradient-to-r from-muted/30 to-muted/50 hover:from-muted/50 hover:to-muted/70 transition-all duration-300 rounded-lg border border-border/50 hover:border-border animate-fade-in"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileText className="h-4 w-4 text-primary" />
            {title}
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 transition-transform duration-200" />
          ) : (
            <ChevronRight className="h-4 w-4 transition-transform duration-200" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 animate-accordion-down">
        <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-l-4 border-l-primary shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {description}
            </p>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}
