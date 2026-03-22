
import { useState } from 'react';
import { useAssessmentAttempts } from '@/hooks/useAssessmentAttempts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function AssessmentManagement() {
  const { attempts, isLoading } = useAssessmentAttempts();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [resultFilter, setResultFilter] = useState<string>('all');

  const filteredAttempts = attempts.filter(attempt => {
    const matchesSearch = attempt.profiles.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attempt.profiles.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attempt.assessments?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || attempt.status === statusFilter;
    
    const matchesResult = resultFilter === 'all' || 
                         (resultFilter === 'passed' && attempt.is_passed) ||
                         (resultFilter === 'failed' && attempt.is_passed === false);

    return matchesSearch && matchesStatus && matchesResult;
  });

  const totalAttempts = attempts.length;
  const completedAttempts = attempts.filter(a => a.status === 'submitted').length;
  const passedAttempts = attempts.filter(a => a.is_passed).length;
  const failedAttempts = attempts.filter(a => a.is_passed === false).length;
  const averageScore = attempts.filter(a => a.score).reduce((acc, curr) => acc + (curr.score || 0), 0) / attempts.filter(a => a.score).length || 0;

  const exportResults = () => {
    const csvContent = [
      ['Name', 'Email', 'Assessment', 'Status', 'Date Submitted', 'Score', 'Result'].join(','),
      ...filteredAttempts.map(attempt => [
        attempt.profiles.full_name || '',
        attempt.profiles.email || '',
        attempt.assessments?.title || '',
        attempt.status,
        attempt.submitted_at ? format(new Date(attempt.submitted_at), 'yyyy-MM-dd HH:mm') : 'Not submitted',
        `${attempt.correct_answers || 0}/${attempt.total_questions || 0}`,
        attempt.score ? `${attempt.score}%` : 'N/A',
        attempt.is_passed ? 'Passed' : (attempt.is_passed === false ? 'Failed' : 'Pending')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assessment-results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading assessment results...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{totalAttempts}</div>
            <div className="text-sm text-muted-foreground">Total Attempts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{completedAttempts}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{passedAttempts}</div>
            <div className="text-sm text-muted-foreground">Passed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{failedAttempts}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{Math.round(averageScore)}%</div>
            <div className="text-sm text-muted-foreground">Avg. Score</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, email, or assessment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by result" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportResults} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Results Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Submitted</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttempts.map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{attempt.profiles.full_name || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">{attempt.profiles.email || 'Unknown'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{attempt.assessments?.title || 'Unknown Assessment'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        attempt.status === 'submitted' ? 'default' :
                        attempt.status === 'in_progress' ? 'secondary' : 'destructive'
                      }>
                        {attempt.status === 'submitted' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {attempt.status === 'in_progress' && <Clock className="h-3 w-3 mr-1" />}
                        {attempt.status === 'expired' && <XCircle className="h-3 w-3 mr-1" />}
                        {attempt.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {attempt.submitted_at ? format(new Date(attempt.submitted_at), 'MMM dd, yyyy HH:mm') : 'Not submitted'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{attempt.correct_answers || 0}/{attempt.total_questions || 0}</span>
                        <span className="text-sm text-muted-foreground">
                          {attempt.score ? `${attempt.score}%` : 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {attempt.is_passed === true && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Passed
                        </Badge>
                      )}
                      {attempt.is_passed === false && (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Failed
                        </Badge>
                      )}
                      {attempt.is_passed === null && (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredAttempts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No assessment results found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
