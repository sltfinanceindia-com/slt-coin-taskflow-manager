import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { 
  FileText, 
  Plus, 
  Download, 
  CheckCircle, 
  Clock,
  Upload,
  Eye,
  Trash2
} from 'lucide-react';

const DOCUMENT_TYPES = [
  { value: 'aadhaar', label: 'Aadhaar Card' },
  { value: 'pan', label: 'PAN Card' },
  { value: 'passport', label: 'Passport' },
  { value: 'driving_license', label: 'Driving License' },
  { value: 'voter_id', label: 'Voter ID' },
  { value: 'resume', label: 'Resume/CV' },
  { value: 'offer_letter', label: 'Offer Letter' },
  { value: 'contract', label: 'Employment Contract' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'other', label: 'Other' },
];

export function DocumentManager() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newDocument, setNewDocument] = useState({
    document_type: '',
    document_name: '',
    document_number: '',
    expiry_date: '',
    file_url: '',
  });

  // Fetch documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['employee-documents', profile?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_documents')
        .select('*')
        .eq('employee_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });

  // Upload document mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async (doc: typeof newDocument) => {
      const { data, error } = await supabase
        .from('employee_documents')
        .insert({
          organization_id: profile?.organization_id,
          employee_id: profile?.id,
          document_type: doc.document_type,
          document_name: doc.document_name,
          document_number: doc.document_number || null,
          expiry_date: doc.expiry_date || null,
          file_url: doc.file_url || 'pending_upload',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents'] });
      setIsUploadOpen(false);
      setNewDocument({
        document_type: '',
        document_name: '',
        document_number: '',
        expiry_date: '',
        file_url: '',
      });
      toast({ title: 'Document uploaded successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error uploading document', description: error.message, variant: 'destructive' });
    },
  });

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employee_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-documents'] });
      toast({ title: 'Document deleted' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting document', description: error.message, variant: 'destructive' });
    },
  });

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Documents</h1>
          <p className="text-muted-foreground">Manage your personal and employment documents</p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>Add a new document to your profile</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Document Type</Label>
                <Select 
                  value={newDocument.document_type} 
                  onValueChange={(v) => setNewDocument(prev => ({ ...prev, document_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Document Name</Label>
                <Input 
                  value={newDocument.document_name}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, document_name: e.target.value }))}
                  placeholder="e.g., My Aadhaar Card"
                />
              </div>
              <div>
                <Label>Document Number (Optional)</Label>
                <Input 
                  value={newDocument.document_number}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, document_number: e.target.value }))}
                  placeholder="e.g., XXXX-XXXX-XXXX"
                />
              </div>
              <div>
                <Label>Expiry Date (Optional)</Label>
                <Input 
                  type="date"
                  value={newDocument.expiry_date}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, expiry_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>File URL</Label>
                <Input 
                  value={newDocument.file_url}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, file_url: e.target.value }))}
                  placeholder="Enter file URL or upload link"
                />
                <p className="text-xs text-muted-foreground mt-1">Upload your file and paste the URL here</p>
              </div>
              <Button 
                className="w-full" 
                onClick={() => uploadDocumentMutation.mutate(newDocument)}
                disabled={uploadDocumentMutation.isPending || !newDocument.document_type || !newDocument.document_name}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadDocumentMutation.isPending ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Documents Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
              <div className="text-2xl font-bold">{documents?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Total Documents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <div className="text-2xl font-bold">{documents?.filter(d => d.is_verified).length || 0}</div>
              <p className="text-xs text-muted-foreground">Verified</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
              <div className="text-2xl font-bold">{documents?.filter(d => !d.is_verified).length || 0}</div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto text-red-500 mb-2" />
              <div className="text-2xl font-bold">
                {documents?.filter(d => d.expiry_date && new Date(d.expiry_date) < new Date()).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Expired</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Document Library</CardTitle>
          <CardDescription>All your uploaded documents</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : documents && documents.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Number</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.document_name}</TableCell>
                      <TableCell>{getDocumentTypeLabel(doc.document_type)}</TableCell>
                      <TableCell className="font-mono text-sm">{doc.document_number || '-'}</TableCell>
                      <TableCell>
                        {doc.expiry_date ? format(new Date(doc.expiry_date), 'MMM dd, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        {doc.is_verified ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30">
                            <CheckCircle className="h-3 w-3 mr-1" />Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                            onClick={() => deleteDocumentMutation.mutate(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No documents uploaded yet</p>
              <p className="text-sm">Upload your first document to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
