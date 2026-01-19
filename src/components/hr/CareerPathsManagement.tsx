import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitBranch, Plus, Search, ArrowRight, Star, BookOpen, Award } from 'lucide-react';

interface CareerPath {
  id: string;
  track: string;
  department: string;
  levels: {
    level: string;
    title: string;
    min_years: number;
    salary_range: string;
    skills: string[];
  }[];
}

export function CareerPathsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Mock data
  const careerPaths: CareerPath[] = [
    {
      id: '1',
      track: 'Engineering',
      department: 'Technology',
      levels: [
        { level: 'L1', title: 'Junior Software Engineer', min_years: 0, salary_range: '6-10L', skills: ['JavaScript', 'React', 'Git'] },
        { level: 'L2', title: 'Software Engineer', min_years: 2, salary_range: '10-15L', skills: ['TypeScript', 'Node.js', 'SQL'] },
        { level: 'L3', title: 'Senior Software Engineer', min_years: 4, salary_range: '15-25L', skills: ['System Design', 'Mentoring', 'Code Review'] },
        { level: 'L4', title: 'Staff Engineer', min_years: 7, salary_range: '25-40L', skills: ['Architecture', 'Technical Leadership', 'Cross-team Collaboration'] },
        { level: 'L5', title: 'Principal Engineer', min_years: 10, salary_range: '40-60L', skills: ['Strategy', 'Innovation', 'Industry Leadership'] },
      ]
    },
    {
      id: '2',
      track: 'Engineering Management',
      department: 'Technology',
      levels: [
        { level: 'M1', title: 'Engineering Manager', min_years: 5, salary_range: '25-35L', skills: ['Team Management', 'Agile', 'Hiring'] },
        { level: 'M2', title: 'Senior Engineering Manager', min_years: 8, salary_range: '35-50L', skills: ['Multi-team Management', 'Roadmap Planning', 'Stakeholder Management'] },
        { level: 'M3', title: 'Director of Engineering', min_years: 10, salary_range: '50-80L', skills: ['Department Strategy', 'Budget Management', 'Org Design'] },
        { level: 'M4', title: 'VP of Engineering', min_years: 12, salary_range: '80-120L', skills: ['Executive Leadership', 'Business Strategy', 'P&L'] },
      ]
    },
    {
      id: '3',
      track: 'Product',
      department: 'Product',
      levels: [
        { level: 'P1', title: 'Associate Product Manager', min_years: 0, salary_range: '8-12L', skills: ['User Research', 'Analytics', 'Documentation'] },
        { level: 'P2', title: 'Product Manager', min_years: 2, salary_range: '12-20L', skills: ['Roadmapping', 'A/B Testing', 'Stakeholder Communication'] },
        { level: 'P3', title: 'Senior Product Manager', min_years: 5, salary_range: '20-35L', skills: ['Strategy', 'Cross-functional Leadership', 'Metrics'] },
        { level: 'P4', title: 'Director of Product', min_years: 8, salary_range: '35-60L', skills: ['Portfolio Management', 'Team Building', 'Vision'] },
      ]
    },
  ];

  const filteredPaths = careerPaths.filter(p => {
    const matchesSearch = p.track.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || p.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(careerPaths.map(p => p.department))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Career Paths</h2>
          <p className="text-muted-foreground">Career progression frameworks and growth ladders</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Track
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Career Track</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input placeholder="Track Name (e.g., Engineering)" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech">Technology</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={() => setIsDialogOpen(false)}>Create Track</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tracks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Career Tracks */}
      <Tabs defaultValue={filteredPaths[0]?.id} className="w-full">
        <TabsList className="w-full flex-wrap h-auto gap-2 p-2">
          {filteredPaths.map((path) => (
            <TabsTrigger key={path.id} value={path.id} className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              {path.track}
            </TabsTrigger>
          ))}
        </TabsList>

        {filteredPaths.map((path) => (
          <TabsContent key={path.id} value={path.id} className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{path.track} Track</CardTitle>
                    <p className="text-sm text-muted-foreground">{path.department} Department</p>
                  </div>
                  <Badge variant="secondary">{path.levels.length} Levels</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Career ladder visualization */}
                  <div className="space-y-4">
                    {path.levels.map((level, index) => (
                      <div key={index} className="relative">
                        {index > 0 && (
                          <div className="absolute left-6 -top-4 h-4 w-0.5 bg-border" />
                        )}
                        <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-bold text-primary">{level.level}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold">{level.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {level.min_years === 0 ? 'Entry Level' : `${level.min_years}+ years experience`}
                                </p>
                              </div>
                              <Badge variant="outline" className="font-mono">₹{level.salary_range}</Badge>
                            </div>
                            <div className="mt-3">
                              <p className="text-xs text-muted-foreground mb-2">Key Skills:</p>
                              <div className="flex flex-wrap gap-1">
                                {level.skills.map((skill, skillIndex) => (
                                  <Badge key={skillIndex} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          {index < path.levels.length - 1 && (
                            <ArrowRight className="h-5 w-5 text-muted-foreground rotate-90" />
                          )}
                          {index === path.levels.length - 1 && (
                            <Star className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <GitBranch className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{careerPaths.length}</p>
                <p className="text-sm text-muted-foreground">Career Tracks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Award className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{careerPaths.reduce((acc, p) => acc + p.levels.length, 0)}</p>
                <p className="text-sm text-muted-foreground">Total Levels</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{departments.length}</p>
                <p className="text-sm text-muted-foreground">Departments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
