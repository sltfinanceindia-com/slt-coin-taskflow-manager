/**
 * Project Files Tab
 * File browser, upload, document management
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Folder, Download, Eye, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, parseISO } from 'date-fns';

interface ProjectFilesTabProps {
  projectId: string;
}

export function ProjectFilesTab({ projectId }: ProjectFilesTabProps) {
  // Documents would be fetched here when properly connected
  const documents: any[] = [];

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-end">
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload File
        </Button>
      </div>

      {/* Folders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Folders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Documents', 'Designs', 'Reports', 'Contracts'].map((folder) => (
              <div 
                key={folder}
                className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                <Folder className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="font-medium">{folder}</p>
                  <p className="text-xs text-muted-foreground">0 files</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Files
          </CardTitle>
          <CardDescription>Documents and attachments</CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No files uploaded yet</p>
              <Button className="mt-4" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Upload First File
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.created_at && format(parseISO(doc.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
