/**
 * Ticket Form
 * Create/edit ticket dialog
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useServiceDesk, TicketType, TicketPriority, CreateTicketData } from '@/hooks/useServiceDesk';
import { Loader2, Ticket } from 'lucide-react';

interface TicketFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTicket?: any;
}

export function TicketForm({ open, onOpenChange, editTicket }: TicketFormProps) {
  const { createTicket, isCreating } = useServiceDesk();
  
  const [formData, setFormData] = useState<CreateTicketData>({
    ticket_type: 'incident',
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    is_major_incident: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTicket(formData);
    onOpenChange(false);
    setFormData({
      ticket_type: 'incident',
      title: '',
      description: '',
      priority: 'medium',
      category: '',
      is_major_incident: false,
    });
  };

  const typeOptions: { value: TicketType; label: string; description: string }[] = [
    { value: 'incident', label: 'Incident', description: 'Something is broken or not working' },
    { value: 'request', label: 'Service Request', description: 'Request for a service or access' },
    { value: 'change', label: 'Change', description: 'Request to change something' },
    { value: 'problem', label: 'Problem', description: 'Root cause investigation' },
  ];

  const priorityOptions: { value: TicketPriority; label: string }[] = [
    { value: 'critical', label: 'Critical - Business stopped' },
    { value: 'urgent', label: 'Urgent - Major impact' },
    { value: 'high', label: 'High - Significant impact' },
    { value: 'medium', label: 'Medium - Moderate impact' },
    { value: 'low', label: 'Low - Minor impact' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Create New Ticket
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ticket Type */}
          <div className="space-y-2">
            <Label>Ticket Type</Label>
            <Select
              value={formData.ticket_type}
              onValueChange={(v) => setFormData({ ...formData, ticket_type: v as TicketType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div>
                      <p className="font-medium">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="Brief summary of the issue"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Detailed description of the issue..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(v) => setFormData({ ...formData, priority: v as TicketPriority })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category (Optional)</Label>
            <Input
              placeholder="e.g., Network, Application, Hardware"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          {/* Major Incident Toggle */}
          {formData.ticket_type === 'incident' && (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label className="font-medium">Major Incident</Label>
                <p className="text-xs text-muted-foreground">
                  Mark as major incident for critical business impact
                </p>
              </div>
              <Switch
                checked={formData.is_major_incident}
                onCheckedChange={(checked) => setFormData({ ...formData, is_major_incident: checked })}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.title || isCreating}>
              {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Ticket
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
