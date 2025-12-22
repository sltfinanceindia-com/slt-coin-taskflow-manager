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
  const { user, profile } = useAuth();
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File, messageId: string): Promise<FileAttachment | null> => {
    if (!user || !profile) {
      console.error('[FileUpload] No user or profile found');
      toast({
        title: "Error",
        description: "You must be logged in to upload files",
        variant: "destructive"
      });
      return null;
    }

    console.log('[FileUpload] Starting upload for message:', messageId);
    console.log('[FileUpload] User ID (auth):', user.id);
    console.log('[FileUpload] Profile ID:', profile.id);

    setUploading(true);
    try {
      // Generate unique file path - use 'shared' folder for org-wide access
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `shared/${fileName}`;

      console.log('[FileUpload] Uploading to path:', filePath);

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('[FileUpload] Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('[FileUpload] Storage upload success:', uploadData.path);

      // Save file metadata to database - use profile.id for RLS policy
      const { data: attachmentData, error: dbError } = await supabase
        .from('file_attachments')
        .insert({
          message_id: messageId,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
          storage_path: uploadData.path,
          uploaded_by: profile.id,
          organization_id: profile.organization_id
        })
        .select()
        .single();

      if (dbError) {
        console.error('[FileUpload] Database insert error:', dbError);
        throw dbError;
      }

      console.log('[FileUpload] Attachment saved:', attachmentData);

      toast({
        title: "Success",
        description: "File uploaded successfully"
      });

      return attachmentData;
    } catch (error) {
      console.error('[FileUpload] Error uploading file:', error);
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

  const getFileUrl = async (storagePath: string, bucketName: string = 'attachments'): Promise<string | null> => {
    try {
      // Use signed URL for private buckets, public URL for public buckets
      const { data: bucketData } = await supabase.storage.getBucket(bucketName);
      
      if (bucketData?.public) {
        const { data } = supabase.storage
          .from(bucketName)
          .getPublicUrl(storagePath);
        return data.publicUrl;
      }
      
      // For private buckets, use signed URL
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(storagePath, 3600 * 24); // 24 hour expiry

      if (error || !data?.signedUrl) {
        console.error('No signed URL returned for path:', storagePath, error);
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

  const downloadFile = async (attachment: FileAttachment, bucketName: string = 'attachments') => {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
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