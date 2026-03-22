import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitBranch, Plus, Search, ArrowRight, Star, BookOpen, Award, Loader2, FileX, AlertCircle } from 'lucide-react';
import { useCareerPaths } from '@/hooks/useCareerPaths';

export function CareerPathsManagement() {
  const { paths, isLoading, error, createPath } = useCareerPaths();
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPath, setNewPath] = useState({
    track_name: '',
    department: '',
    description: '',
  });

  const handleCreatePath = () => {
    if (!newPath.track_name || !newPath.department) return;
    createPath.mutate(newPath);
    setIsDialogOpen(false);
    setNewPath({ track_name: '', department: '', description: '' });
  };

  const filteredPaths = paths.filter(p => {
    const matchesSearch = p.track_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || p.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(paths.map(p => p.department))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center border-destructive">
        <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
        <h3 className="mt-4 font-semibold">Error loading career paths</h3>
        <p className="text-muted-foreground">{error.message}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
              <div>
                <Label>Track Name</Label>
                <Input 
                  placeholder="e.g., Engineering" 
                  value={newPath.track_name}
                  onChange={(e) => setNewPath(prev => ({ ...prev, track_name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Department</Label>
                <Select value={newPath.department} onValueChange={(v) => setNewPath(prev => ({ ...prev, department: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Design">Design</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Input 
                  placeholder="Brief description of the track" 
                  value={newPath.description}
                  onChange={(e) => setNewPath(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handleCreatePath}
                disabled={!newPath.track_name || !newPath.department || createPath.isPending}
              >
                {createPath.isPending ? 'Creating...' : 'Create Track'}
              </Button>
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

      {filteredPaths.length === 0 ? (
        <Card className="p-8 text-center">
          <FileX className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 font-semibold">No career paths found</h3>
          <p className="text-muted-foreground">Create a career track to get started</p>
          <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Track
          </Button>
        </Card>
      ) : (
        <>
          {/* Career Tracks */}
          <Tabs defaultValue={filteredPaths[0]?.id} className="w-full">
            <TabsList className="w-full flex-wrap h-auto gap-2 p-2">
              {filteredPaths.map((path) => (
                <TabsTrigger key={path.id} value={path.id} className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  {path.track_name}
                </TabsTrigger>
              ))}
            </TabsList>

            {filteredPaths.map((path) => (
              <TabsContent key={path.id} value={path.id} className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{path.track_name} Track</CardTitle>
                        <p className="text-sm text-muted-foreground">{path.department} Department</p>
                        {path.description && (
                          <p className="text-sm text-muted-foreground mt-1">{path.description}</p>
                        )}
                      </div>
                      <Badge variant="secondary">{path.levels?.length || 0} Levels</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!path.levels || path.levels.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No levels defined for this track yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {path.levels.sort((a, b) => a.level_order - b.level_order).map((level, index) => (
                          <div key={level.id} className="relative">
                            {index > 0 && (
                              <div className="absolute left-6 -top-4 h-4 w-0.5 bg-border" />
                            )}
                            <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="font-bold text-primary">L{level.level_order}</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-semibold">{level.title}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {level.experience_min === 0 ? 'Entry Level' : `${level.experience_min}+ years experience`}
                                    </p>
                                  </div>
                                  {level.salary_min && level.salary_max && (
                                    <Badge variant="outline" className="font-mono">
                                      ₹{(level.salary_min / 100000).toFixed(0)}-{(level.salary_max / 100000).toFixed(0)}L
                                    </Badge>
                                  )}
                                </div>
                                {level.skills && level.skills.length > 0 && (
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
                                )}
                              </div>
                              {index < (path.levels?.length || 0) - 1 ? (
                                <ArrowRight className="h-5 w-5 text-muted-foreground rotate-90" />
                              ) : (
                                <Star className="h-5 w-5 text-yellow-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                    <p className="text-2xl font-bold">{paths.length}</p>
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
                    <p className="text-2xl font-bold">{paths.reduce((acc, p) => acc + (p.levels?.length || 0), 0)}</p>
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
        </>
      )}
    </div>
  );
}
