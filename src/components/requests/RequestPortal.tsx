import React, { useState } from 'react';
import { useWorkRequests, RequestType, CreateWorkRequestData } from '@/hooks/useWorkRequests';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { FileText, Send, Monitor, Users, Megaphone, DollarSign, HelpCircle, CheckCircle } from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  Monitor,
  Users,
  Megaphone,
  DollarSign,
  HelpCircle,
};

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-gray-500' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
];

export function RequestPortal() {
  const { requestTypes, isLoading, createRequest, isCreating } = useWorkRequests();
  const [selectedType, setSelectedType] = useState<RequestType | null>(null);
  const [formData, setFormData] = useState<CreateWorkRequestData>({
    request_type_id: '',
    title: '',
    description: '',
    priority: 'medium',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSelectType = (type: RequestType) => {
    setSelectedType(type);
    setFormData({
      ...formData,
      request_type_id: type.id,
      priority: type.default_priority,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRequest(formData, {
      onSuccess: () => {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setSelectedType(null);
          setFormData({ request_type_id: '', title: '', description: '', priority: 'medium' });
        }, 3000);
      },
    });
  };

  const handleBack = () => {
    setSelectedType(null);
    setFormData({ request_type_id: '', title: '', description: '', priority: 'medium' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Request Submitted!</h2>
        <p className="text-muted-foreground mb-6">
          Your request has been submitted successfully. You'll be notified of updates.
        </p>
        <Button onClick={() => setSubmitted(false)}>Submit Another Request</Button>
      </div>
    );
  }

  if (selectedType) {
    const IconComponent = ICON_MAP[selectedType.icon] || FileText;
    
    return (
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          ← Back to request types
        </Button>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${selectedType.color}20` }}
              >
                <IconComponent className="h-6 w-6" style={{ color: selectedType.color }} />
              </div>
              <div>
                <CardTitle>{selectedType.name}</CardTitle>
                <CardDescription>{selectedType.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Request Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief summary of your request"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide details about your request..."
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <div className="grid grid-cols-4 gap-2">
                  {PRIORITY_OPTIONS.map(option => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={formData.priority === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData({ ...formData, priority: option.value as any })}
                      className="relative"
                    >
                      <span className={`w-2 h-2 rounded-full ${option.color} mr-2`} />
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium mb-1">Expected Response Time</p>
                <p className="text-muted-foreground">
                  Response within {selectedType.sla_response_hours} hours • 
                  Resolution within {selectedType.sla_resolution_hours} hours
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleBack}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || !formData.title} className="gap-2">
                  <Send className="h-4 w-4" />
                  {isCreating ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Request Portal</h1>
        <p className="text-muted-foreground">
          Select the type of request you'd like to submit. Your request will be routed to the appropriate team.
        </p>
      </div>

      {requestTypes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Request Types"
          description="No request types have been configured yet"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {requestTypes.map(type => {
            const IconComponent = ICON_MAP[type.icon] || FileText;
            return (
              <Card
                key={type.id}
                className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                onClick={() => handleSelectType(type)}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${type.color}15` }}
                    >
                      <IconComponent className="h-7 w-7" style={{ color: type.color }} />
                    </div>
                    <h3 className="font-semibold mb-1">{type.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {type.description}
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {type.sla_response_hours}h response
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
