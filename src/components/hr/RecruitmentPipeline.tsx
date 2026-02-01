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
import { useJobApplications, APPLICATION_STAGES, type ApplicationStage, type CreateApplicationInput } from '@/hooks/useJobApplications';
import { format } from 'date-fns';
import { 
  Plus, Mail, Download, Loader2
} from 'lucide-react';

export function RecruitmentPipeline() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filter, setFilter] = useState<ApplicationStage | 'all'>('all');

  const { 
    applications, 
    isLoading, 
    stageStats, 
    createApplication, 
    updateStage 
  } = useJobApplications(filter);

  const [newCandidate, setNewCandidate] = useState<CreateApplicationInput>({
    candidate_name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    source: 'linkedin',
    experience_years: 0,
    current_salary: 0,
    expected_salary: 0,
    notes: '',
  });

  const handleCreateCandidate = async () => {
    await createApplication.mutateAsync(newCandidate);
    setIsCreateOpen(false);
    setNewCandidate({
      candidate_name: '', 
      email: '', 
      phone: '', 
      position: '', 
      department: '',
      source: 'linkedin', 
      experience_years: 0, 
      current_salary: 0, 
      expected_salary: 0, 
      notes: '',
    });
  };

  const getStageBadge = (stage: ApplicationStage) => {
    const stageInfo = APPLICATION_STAGES.find(s => s.key === stage);
    return <Badge className={stageInfo?.color || 'bg-gray-100'}>{stageInfo?.label || stage}</Badge>;
  };

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
                    value={newCandidate.candidate_name}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, candidate_name: e.target.value }))}
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
                    value={newCandidate.phone || ''}
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
                    value={newCandidate.department || ''}
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
                    value={newCandidate.source || 'linkedin'}
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
                    value={newCandidate.experience_years || ''}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, experience_years: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label>Current Salary (₹ LPA)</Label>
                  <Input
                    type="number"
                    value={newCandidate.current_salary || ''}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, current_salary: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label>Expected Salary (₹ LPA)</Label>
                  <Input
                    type="number"
                    value={newCandidate.expected_salary || ''}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, expected_salary: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={newCandidate.notes || ''}
                    onChange={(e) => setNewCandidate(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about the candidate"
                    rows={3}
                  />
                </div>
                <div className="col-span-2">
                  <Button
                    className="w-full"
                    onClick={handleCreateCandidate}
                    disabled={createApplication.isPending || !newCandidate.candidate_name || !newCandidate.position}
                  >
                    {createApplication.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Candidate'
                    )}
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
          <Card 
            key={stage.key} 
            className={`cursor-pointer hover:shadow-md transition-shadow ${filter === stage.key ? 'ring-2 ring-primary' : ''}`} 
            onClick={() => setFilter(stage.key)}
          >
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
          All ({applications.length})
        </Button>
        {APPLICATION_STAGES.slice(0, 6).map((stage) => (
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
            {filter === 'all' ? 'All candidates' : `Candidates in ${APPLICATION_STAGES.find(s => s.key === filter)?.label} stage`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : applications.length > 0 ? (
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
                {applications.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{candidate.candidate_name}</div>
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
                        onValueChange={(v) => updateStage.mutate({ id: candidate.id, stage: v as ApplicationStage })}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {APPLICATION_STAGES.map((stage) => (
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
              <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No candidates found</p>
              <p className="text-sm">Add candidates to start tracking</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
