/**
 * Location Management Component
 * CRUD operations for organization branches/locations
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, MapPin, Building, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Location {
  id: string;
  name: string;
  code: string;
  type: 'headquarters' | 'branch' | 'remote';
  address: string;
  city: string;
  country: string;
  timezone: string;
  employeeCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

const mockLocations: Location[] = [
  {
    id: '1',
    name: 'Headquarters',
    code: 'HQ',
    type: 'headquarters',
    address: '123 Main Street',
    city: 'Mumbai',
    country: 'India',
    timezone: 'Asia/Kolkata',
    employeeCount: 150,
    status: 'active',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Bangalore Office',
    code: 'BLR',
    type: 'branch',
    address: '456 Tech Park',
    city: 'Bangalore',
    country: 'India',
    timezone: 'Asia/Kolkata',
    employeeCount: 75,
    status: 'active',
    createdAt: '2024-02-15',
  },
  {
    id: '3',
    name: 'Remote - US',
    code: 'RMT-US',
    type: 'remote',
    address: 'Remote',
    city: 'Various',
    country: 'United States',
    timezone: 'America/New_York',
    employeeCount: 25,
    status: 'active',
    createdAt: '2024-03-01',
  },
];

export function LocationManagement() {
  const [locations, setLocations] = useState<Location[]>(mockLocations);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'branch' as 'headquarters' | 'branch' | 'remote',
    address: '',
    city: '',
    country: '',
    timezone: '',
    status: 'active' as 'active' | 'inactive',
  });

  const filteredLocations = locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        code: location.code,
        type: location.type,
        address: location.address,
        city: location.city,
        country: location.country,
        timezone: location.timezone,
        status: location.status,
      });
    } else {
      setEditingLocation(null);
      setFormData({
        name: '',
        code: '',
        type: 'branch',
        address: '',
        city: '',
        country: '',
        timezone: '',
        status: 'active',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.code || !formData.city) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (editingLocation) {
      setLocations(
        locations.map((loc) =>
          loc.id === editingLocation.id ? { ...loc, ...formData } : loc
        )
      );
      toast({
        title: 'Location Updated',
        description: `${formData.name} has been updated successfully.`,
      });
    } else {
      const newLocation: Location = {
        id: Date.now().toString(),
        ...formData,
        employeeCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setLocations([...locations, newLocation]);
      toast({
        title: 'Location Created',
        description: `${formData.name} has been created successfully.`,
      });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const loc = locations.find((l) => l.id === id);
    setLocations(locations.filter((l) => l.id !== id));
    toast({
      title: 'Location Deleted',
      description: `${loc?.name} has been deleted.`,
    });
  };

  const getTypeColor = (type: Location['type']) => {
    switch (type) {
      case 'headquarters':
        return 'bg-purple-500/10 text-purple-600';
      case 'branch':
        return 'bg-blue-500/10 text-blue-600';
      case 'remote':
        return 'bg-green-500/10 text-green-600';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Location Management</h2>
          <p className="text-muted-foreground">
            Manage office locations and branches
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{locations.length}</p>
                <p className="text-sm text-muted-foreground">Total Locations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {locations.filter((l) => l.type === 'headquarters').length}
                </p>
                <p className="text-sm text-muted-foreground">Headquarters</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {locations.filter((l) => l.type === 'branch').length}
                </p>
                <p className="text-sm text-muted-foreground">Branches</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Globe className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {locations.filter((l) => l.type === 'remote').length}
                </p>
                <p className="text-sm text-muted-foreground">Remote Hubs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Locations Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>All Locations</CardTitle>
            <Input
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Employees</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLocations.map((loc) => (
                <TableRow key={loc.id}>
                  <TableCell className="font-medium">{loc.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{loc.code}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(loc.type)}>{loc.type}</Badge>
                  </TableCell>
                  <TableCell>{loc.city}</TableCell>
                  <TableCell>{loc.country}</TableCell>
                  <TableCell>{loc.employeeCount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={loc.status === 'active' ? 'default' : 'secondary'}
                    >
                      {loc.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(loc)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(loc.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'Edit Location' : 'Add Location'}
            </DialogTitle>
            <DialogDescription>
              {editingLocation
                ? 'Update location information'
                : 'Add a new office location or branch'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Location Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Bangalore Office"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g., BLR"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Location Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'headquarters' | 'branch' | 'remote') =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="headquarters">Headquarters</SelectItem>
                  <SelectItem value="branch">Branch Office</SelectItem>
                  <SelectItem value="remote">Remote Hub</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Street address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="e.g., Bangalore"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  placeholder="e.g., India"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) =>
                    setFormData({ ...formData, timezone: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                    <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive') =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingLocation ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
