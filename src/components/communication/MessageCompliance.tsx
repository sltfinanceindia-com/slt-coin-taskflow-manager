import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Clock, Archive, AlertTriangle, Settings, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RetentionPolicy {
  id: string;
  name: string;
  description: string;
  retention_days: number;
  applies_to: 'all' | 'channels' | 'direct_messages';
  channel_patterns: string[];
  is_active: boolean;
  created_at: string;
}

interface ComplianceExport {
  id: string;
  request_type: 'legal_hold' | 'audit' | 'compliance';
  date_range: { from: string; to: string };
  channels: string[];
  users: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  file_url?: string;
}

export default function MessageCompliance() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'retention' | 'exports' | 'audit'>('retention');
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>([
    {
      id: '1',
      name: 'General Channel Retention',
      description: 'Retain all general channel messages for 7 years',
      retention_days: 2555, // 7 years
      applies_to: 'channels',
      channel_patterns: ['general*', 'announcements*'],
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Direct Message Retention',
      description: 'Retain direct messages for 3 years',
      retention_days: 1095, // 3 years
      applies_to: 'direct_messages',
      channel_patterns: [],
      is_active: true,
      created_at: new Date().toISOString()
    }
  ]);
  const [exports, setExports] = useState<ComplianceExport[]>([
    {
      id: '1',
      request_type: 'legal_hold',
      date_range: { from: '2024-01-01', to: '2024-12-31' },
      channels: ['general', 'project-alpha'],
      users: ['john.doe@company.com'],
      status: 'completed',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      completed_at: new Date().toISOString(),
      file_url: '/exports/legal-hold-2024.zip'
    }
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPolicy, setNewPolicy] = useState<{
    name: string;
    description: string;
    retention_days: number;
    applies_to: 'all' | 'channels' | 'direct_messages';
    channel_patterns: string;
  }>({
    name: '',
    description: '',
    retention_days: 365,
    applies_to: 'all',
    channel_patterns: ''
  });

  const handleCreatePolicy = () => {
    if (!newPolicy.name.trim() || !newPolicy.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const policy: RetentionPolicy = {
      id: Date.now().toString(),
      name: newPolicy.name,
      description: newPolicy.description,
      retention_days: newPolicy.retention_days,
      applies_to: newPolicy.applies_to,
      channel_patterns: newPolicy.channel_patterns.split(',').map(p => p.trim()).filter(Boolean),
      is_active: true,
      created_at: new Date().toISOString()
    };

    setRetentionPolicies(prev => [...prev, policy]);
    toast({ title: "Retention policy created successfully" });
    setIsDialogOpen(false);
    setNewPolicy({
      name: '',
      description: '',
      retention_days: 365,
      applies_to: 'all',
      channel_patterns: ''
    });
  };

  const handleTogglePolicy = (policyId: string) => {
    setRetentionPolicies(prev => prev.map(p => 
      p.id === policyId ? { ...p, is_active: !p.is_active } : p
    ));
    toast({ title: "Policy status updated" });
  };

  const handleRequestExport = () => {
    const newExport: ComplianceExport = {
      id: Date.now().toString(),
      request_type: 'audit',
      date_range: { 
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
      },
      channels: ['all'],
      users: ['all'],
      status: 'pending',
      created_at: new Date().toISOString()
    };

    setExports(prev => [...prev, newExport]);
    toast({ 
      title: "Export requested",
      description: "Your compliance export has been queued for processing"
    });
  };

  const formatRetentionPeriod = (days: number) => {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      const remainingDays = days % 365;
      if (remainingDays === 0) {
        return `${years} year${years > 1 ? 's' : ''}`;
      }
      return `${years} year${years > 1 ? 's' : ''} ${remainingDays} days`;
    }
    return `${days} days`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Message Compliance</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b">
        {[
          { id: 'retention', label: 'Retention Policies', icon: Clock },
          { id: 'exports', label: 'Data Exports', icon: Download },
          { id: 'audit', label: 'Audit Logs', icon: Archive }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Retention Policies Tab */}
      {activeTab === 'retention' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Retention Policies</h3>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Create Policy
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Retention Policy</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Policy name"
                    value={newPolicy.name}
                    onChange={(e) => setNewPolicy(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Textarea
                    placeholder="Policy description"
                    value={newPolicy.description}
                    onChange={(e) => setNewPolicy(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                  <div>
                    <label className="text-sm font-medium">Retention Period (days)</label>
                    <Input
                      type="number"
                      value={newPolicy.retention_days}
                      onChange={(e) => setNewPolicy(prev => ({ ...prev, retention_days: parseInt(e.target.value) || 365 }))}
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Applies To</label>
                    <select
                      className="w-full p-2 border rounded-md mt-1"
                      value={newPolicy.applies_to}
                      onChange={(e) => setNewPolicy(prev => ({ ...prev, applies_to: e.target.value as any }))}
                    >
                      <option value="all">All Messages</option>
                      <option value="channels">Channels Only</option>
                      <option value="direct_messages">Direct Messages Only</option>
                    </select>
                  </div>
                  {newPolicy.applies_to !== 'direct_messages' && (
                    <div>
                      <label className="text-sm font-medium">Channel Patterns (comma-separated)</label>
                      <Input
                        placeholder="general*, project-*, announcements"
                        value={newPolicy.channel_patterns}
                        onChange={(e) => setNewPolicy(prev => ({ ...prev, channel_patterns: e.target.value }))}
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={handleCreatePolicy} className="flex-1">
                      Create Policy
                    </Button>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {retentionPolicies.map((policy) => (
              <Card key={policy.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{policy.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        policy.is_active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}>
                        {policy.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTogglePolicy(policy.id)}
                      >
                        {policy.is_active ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{policy.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Retention Period:</span>
                        <p className="text-muted-foreground">{formatRetentionPeriod(policy.retention_days)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Applies To:</span>
                        <p className="text-muted-foreground capitalize">{policy.applies_to.replace('_', ' ')}</p>
                      </div>
                    </div>
                    {policy.channel_patterns.length > 0 && (
                      <div>
                        <span className="font-medium text-sm">Channel Patterns:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {policy.channel_patterns.map((pattern, index) => (
                            <span key={index} className="px-2 py-1 bg-muted text-xs rounded">
                              {pattern}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Data Exports Tab */}
      {activeTab === 'exports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Compliance Data Exports</h3>
            <Button onClick={handleRequestExport}>
              <Download className="h-4 w-4 mr-2" />
              Request Export
            </Button>
          </div>

          <div className="grid gap-4">
            {exports.map((exportReq) => (
              <Card key={exportReq.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{exportReq.request_type.replace('_', ' ')}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          exportReq.status === 'completed' ? 'bg-green-100 text-green-800' :
                          exportReq.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          exportReq.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {exportReq.status}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(exportReq.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Date Range:</span>
                        <p className="text-muted-foreground">
                          {new Date(exportReq.date_range.from).toLocaleDateString()} - {new Date(exportReq.date_range.to).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Channels:</span>
                        <p className="text-muted-foreground">{exportReq.channels.join(', ')}</p>
                      </div>
                    </div>

                    {exportReq.status === 'completed' && exportReq.file_url && (
                      <Button size="sm" variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Export
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Audit Trail</h3>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Archive className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h4 className="text-lg font-medium">Comprehensive Audit Logging</h4>
                  <p className="text-muted-foreground">
                    All user interactions, message operations, and system events are automatically logged for compliance and security auditing.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">Message Operations</div>
                    <div className="text-muted-foreground">Send, edit, delete, reactions</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">User Actions</div>
                    <div className="text-muted-foreground">Login, logout, profile changes</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">Admin Operations</div>
                    <div className="text-muted-foreground">Policy changes, exports, moderation</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}