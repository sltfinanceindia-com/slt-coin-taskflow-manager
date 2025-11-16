import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface FileAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  uploaded_by: string;
  created_at: string;
}

export const useFileUpload = () => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, messageId: string): Promise<FileAttachment | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload files",
        variant: "destructive"
      });
      return null;
    }

    setUploading(true);
    try {
      // Generate unique file path with user ID for RLS
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      // Save file metadata to database
      const { data: attachmentData, error: dbError } = await supabase
        .from('file_attachments')
        .insert({
          message_id: messageId,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          storage_path: uploadData.path,
          uploaded_by: user.id
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "File uploaded successfully"
      });

      return attachmentData;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const getFileUrl = async (storagePath: string): Promise<string | null> => {
    try {
      const { data } = await supabase.storage
        .from('attachments')
        .createSignedUrl(storagePath, 3600); // 1 hour expiry

      if (!data?.signedUrl) {
        console.error('No signed URL returned for path:', storagePath);
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error getting file URL:', error);
      return null;
    }
  };

  const getPublicUrl = (storagePath: string): string => {
    const { data } = supabase.storage
      .from('attachments')
      .getPublicUrl(storagePath);
    
    return data.publicUrl;
  };

  const downloadFile = async (attachment: FileAttachment) => {
    try {
      const { data, error } = await supabase.storage
        .from('attachments')
        .download(attachment.storage_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive"
      });
    }
  };

  return {
    uploadFile,
    getFileUrl,
    getPublicUrl,
    downloadFile,
    uploading
  };
};