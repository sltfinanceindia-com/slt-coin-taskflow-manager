import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  Plus, Users, UserCheck, Mail, Phone, Briefcase, 
  Calendar, ArrowRight, CheckCircle, XCircle, Clock,
  FileText, Download
} from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  stage: 'applied' | 'screening' | 'interview' | 'technical' | 'hr' | 'offer' | 'hired' | 'rejected';
  source: string;
  experience_years: number;
  current_salary: number;
  expected_salary: number;
  resume_url?: string;
  notes: string;
  interview_date?: string;
  created_at: string;
}

const STAGES = [
  { key: 'applied', label: 'Applied', color: 'bg-gray-100 text-gray-800' },
  { key: 'screening', label: 'Screening', color: 'bg-blue-100 text-blue-800' },
  { key: 'interview', label: 'Interview', color: 'bg-purple-100 text-purple-800' },
  { key: 'technical', label: 'Technical', color: 'bg-indigo-100 text-indigo-800' },
  { key: 'hr', label: 'HR Round', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'offer', label: 'Offer', color: 'bg-orange-100 text-orange-800' },
  { key: 'hired', label: 'Hired', color: 'bg-green-100 text-green-800' },
  { key: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
];

export function RecruitmentPipeline() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const [newCandidate, setNewCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    source: 'linkedin',
    experience_years: '',
    current_salary: '',
    expected_salary: '',
    notes: '',
  });

  // Fetch candidates from tasks table (using task as candidate placeholder)
  const { data: candidates, isLoading } = useQuery({
    queryKey: ['recruitment-candidates', profile?.organization_id, filter],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*')
        .eq('organization_id', profile?.organization_id)
        .like('description', '%[CANDIDATE]%')
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      return data?.map(t => {
        const meta = t.submission_notes ? JSON.parse(t.submission_notes) : {};
        return {
          id: t.id,
          name: t.title,
          email: meta.email || '',
          phone: meta.phone || '',
          position: meta.position || '',
          department: meta.department || '',
          stage: t.status === 'assigned' ? 'applied' : 
                 t.status === 'in_progress' ? 'interview' : 
                 t.status === 'completed' ? 'hired' : 
                 t.status === 'rejected' ? 'rejected' : 'applied',
          source: meta.source || 'direct',
          experience_years: meta.experience_years || 0,
          current_salary: meta.current_salary || 0,
          expected_salary: meta.expected_salary || 0,
          notes: t.admin_feedback || '',
          interview_date: t.end_date,
          created_at: t.created_at,
        } as Candidate;
      }) || [];
    },
    enabled: !!profile?.organization_id,
  });

  const createCandidateMutation = useMutation({
    mutationFn: async (candidate: typeof newCandidate) => {
      const meta = {
        email: candidate.email,
        phone: candidate.phone,
        position: candidate.position,
        department: candidate.department,
        source: candidate.source,
        experience_years: parseFloat(candidate.experience_years) || 0,
        current_salary: parseFloat(candidate.current_salary) || 0,
        expected_salary: parseFloat(candidate.expected_salary) || 0,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          organization_id: profile?.organization_id,
          title: candidate.name,
          description: `[CANDIDATE] ${candidate.position} - ${candidate.department}`,
          submission_notes: JSON.stringify(meta),
          admin_feedback: candidate.notes,
          status: 'assigned',
          priority: 'medium',
          created_by: profile?.id || '',
          assigned_to: profile?.id || '',
          slt_coin_value: 0,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-candidates'] });
      setIsCreateOpen(false);
      setNewCandidate({
        name: '', email: '', phone: '', position: '', department: '',
        source: 'linkedin', experience_years: '', current_salary: '', expected_salary: '', notes: '',
      });
      toast({ title: 'Candidate added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error adding candidate', description: error.message, variant: 'destructive' });
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const statusMap: Record<string, 'assigned' | 'in_progress' | 'completed' | 'rejected' | 'verified'> = {
        'applied': 'assigned',
        'screening': 'assigned',
        'interview': 'in_progress',
        'technical': 'in_progress',
        'hr': 'in_progress',
        'offer': 'in_progress',
        'hired': 'completed',
        'rejected': 'rejected',
      };

      const { error } = await supabase
        .from('tasks')
        .update({ status: statusMap[stage] || 'assigned' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment-candidates'] });
      toast({ title: 'Stage updated successfully' });
    },
  });

  const getStageBadge = (stage: string) => {
    const stageInfo = STAGES.find(s => s.key === stage);
    return <Badge className={stageInfo?.color || 'bg-gray-100'}>{stageInfo?.label || stage}</Badge>;
  };

  const stageStats = STAGES.map(stage => ({
    ...stage,
    count: candidates?.filter(c => c.stage === stage.key).length || 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Recruitment Pipeline</h1>
          <p className="text-muted-foreground">Track candidates through the hiring process</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Candidate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Candidate</DialogTitle>
                <DialogDescription>Enter candidate details for the recruitment pipeline</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="col-span-2">
                  <Label>Full Name</Label>
                  <Input
                    value={newCandidate.name}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Candidate name"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newCandidate.email}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={newCandidate.phone}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <Label>Position</Label>
                  <Input
                    value={newCandidate.position}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="e.g., Senior Developer"
                  />
                </div>
                <div>
                  <Label>Department</Label>
                  <Select
                    value={newCandidate.department}
                    onValueChange={(v) => setNewCandidate(prev => ({ ...prev, department: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Source</Label>
                  <Select
                    value={newCandidate.source}
                    onValueChange={(v) => setNewCandidate(prev => ({ ...prev, source: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="naukri">Naukri</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="careers">Careers Page</SelectItem>
                      <SelectItem value="direct">Direct</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Experience (Years)</Label>
                  <Input
                    type="number"
                    value={newCandidate.experience_years}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, experience_years: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Current Salary (₹ LPA)</Label>
                  <Input
                    type="number"
                    value={newCandidate.current_salary}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, current_salary: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Expected Salary (₹ LPA)</Label>
                  <Input
                    type="number"
                    value={newCandidate.expected_salary}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, expected_salary: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={newCandidate.notes}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about the candidate"
                    rows={3}
                  />
                </div>
                <div className="col-span-2">
                  <Button
                    className="w-full"
                    onClick={() => createCandidateMutation.mutate(newCandidate)}
                    disabled={createCandidateMutation.isPending || !newCandidate.name || !newCandidate.position}
                  >
                    {createCandidateMutation.isPending ? 'Adding...' : 'Add Candidate'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {stageStats.map((stage) => (
          <Card key={stage.key} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter(stage.key)}>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold">{stage.count}</div>
              <Badge className={`${stage.color} text-xs`}>{stage.label}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>
          All ({candidates?.length || 0})
        </Button>
        {STAGES.slice(0, 6).map((stage) => (
          <Button
            key={stage.key}
            variant={filter === stage.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(stage.key)}
          >
            {stage.label}
          </Button>
        ))}
      </div>

      {/* Candidates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Candidates</CardTitle>
          <CardDescription>
            {filter === 'all' ? 'All candidates' : `Candidates in ${STAGES.find(s => s.key === filter)?.label} stage`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : candidates && candidates.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Expected CTC</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{candidate.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="h-3 w-3" />{candidate.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{candidate.position}</div>
                        <div className="text-sm text-muted-foreground">{candidate.department}</div>
                      </div>
                    </TableCell>
                    <TableCell>{candidate.experience_years} years</TableCell>
                    <TableCell>₹{candidate.expected_salary} LPA</TableCell>
                    <TableCell><Badge variant="outline">{candidate.source}</Badge></TableCell>
                    <TableCell>{getStageBadge(candidate.stage)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(candidate.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={candidate.stage}
                        onValueChange={(v) => updateStageMutation.mutate({ id: candidate.id, stage: v })}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STAGES.map((stage) => (
                            <SelectItem key={stage.key} value={stage.key}>
                              {stage.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No candidates found</p>
              <p className="text-sm">Add your first candidate to start tracking</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
