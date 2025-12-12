import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface FileVersion {
  id: string;
  original_file_id: string | null;
  file_name: string;
  file_size: number;
  storage_path: string;
  version_number: number;
  uploaded_by: string;
  change_description: string | null;
  task_id: string | null;
  project_id: string | null;
  organization_id: string | null;
  created_at: string;
  uploader?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export interface FileAnnotation {
  id: string;
  file_version_id: string;
  user_id: string;
  annotation_type: string;
  position_data: {
    x: number;
    y: number;
    width?: number;
    height?: number;
    page?: number;
  };
  content: string | null;
  status: string;
  resolved_by: string | null;
  resolved_at: string | null;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export const useFileVersions = (taskId?: string, projectId?: string) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['file-versions', taskId, projectId],
    queryFn: async () => {
      let query = supabase
        .from('file_versions')
        .select(`
          *,
          uploader:profiles!file_versions_uploaded_by_fkey(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (taskId) {
        query = query.eq('task_id', taskId);
      }
      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FileVersion[];
    },
    enabled: !!profile && (!!taskId || !!projectId),
  });

  const uploadVersion = useMutation({
    mutationFn: async ({
      file,
      taskId,
      projectId,
      changeDescription,
      originalFileId,
    }: {
      file: File;
      taskId?: string;
      projectId?: string;
      changeDescription?: string;
      originalFileId?: string;
    }) => {
      if (!profile) throw new Error('Not authenticated');

      // Get next version number
      let versionNumber = 1;
      if (originalFileId) {
        const { data: existing } = await supabase
          .from('file_versions')
          .select('version_number')
          .eq('original_file_id', originalFileId)
          .order('version_number', { ascending: false })
          .limit(1);

        if (existing && existing.length > 0) {
          versionNumber = existing[0].version_number + 1;
        }
      }

      // Upload file to storage
      const filePath = `${profile.organization_id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('task-attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create version record
      const { data, error } = await supabase
        .from('file_versions')
        .insert({
          original_file_id: originalFileId || null,
          file_name: file.name,
          file_size: file.size,
          storage_path: filePath,
          version_number: versionNumber,
          uploaded_by: profile.id,
          change_description: changeDescription,
          task_id: taskId,
          project_id: projectId,
          organization_id: profile.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['file-versions'] });
      toast({ title: 'File uploaded successfully' });
    },
    onError: (error) => {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    versions,
    isLoading,
    uploadVersion,
  };
};

export const useFileAnnotations = (fileVersionId: string) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: annotations = [], isLoading } = useQuery({
    queryKey: ['file-annotations', fileVersionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('file_annotations')
        .select(`
          *,
          user:profiles!file_annotations_user_id_fkey(full_name, avatar_url)
        `)
        .eq('file_version_id', fileVersionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as FileAnnotation[];
    },
    enabled: !!fileVersionId,
  });

  const createAnnotation = useMutation({
    mutationFn: async (annotation: {
      annotation_type: string;
      position_data: Record<string, unknown>;
      content?: string;
    }) => {
      if (!profile) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('file_annotations')
        .insert([{
          file_version_id: fileVersionId,
          user_id: profile.id,
          organization_id: profile.organization_id,
          annotation_type: annotation.annotation_type,
          position_data: JSON.parse(JSON.stringify(annotation.position_data)),
          content: annotation.content,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['file-annotations', fileVersionId] });
    },
  });

  const resolveAnnotation = useMutation({
    mutationFn: async (annotationId: string) => {
      if (!profile) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('file_annotations')
        .update({
          status: 'resolved',
          resolved_by: profile.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', annotationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['file-annotations', fileVersionId] });
      toast({ title: 'Annotation resolved' });
    },
  });

  return {
    annotations,
    isLoading,
    createAnnotation,
    resolveAnnotation,
  };
};
