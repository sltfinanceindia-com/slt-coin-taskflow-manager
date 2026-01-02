import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Upload, X, Image, FileText, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ReceiptUploadProps {
  expenseId?: string;
  onUpload: (urls: string[]) => void;
  existingReceipts?: string[];
}

export function ReceiptUpload({ expenseId, onUpload, existingReceipts = [] }: ReceiptUploadProps) {
  const { profile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [receipts, setReceipts] = useState<string[]>(existingReceipts);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
          toast({ 
            title: 'Invalid file type', 
            description: 'Only images and PDFs are allowed',
            variant: 'destructive' 
          });
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({ 
            title: 'File too large', 
            description: 'Maximum file size is 5MB',
            variant: 'destructive' 
          });
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${profile?.organization_id}/${profile?.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('expense-receipts')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast({ 
            title: 'Upload failed', 
            description: uploadError.message,
            variant: 'destructive' 
          });
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('expense-receipts')
          .getPublicUrl(fileName);

        uploadedUrls.push(urlData.publicUrl);
      }

      if (uploadedUrls.length > 0) {
        const newReceipts = [...receipts, ...uploadedUrls];
        setReceipts(newReceipts);
        onUpload(newReceipts);
        toast({ title: `${uploadedUrls.length} receipt(s) uploaded` });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({ 
        title: 'Upload failed', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeReceipt = (index: number) => {
    const newReceipts = receipts.filter((_, i) => i !== index);
    setReceipts(newReceipts);
    onUpload(newReceipts);
  };

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Receipt'}
        </Button>
        <span className="text-xs text-muted-foreground">
          Max 5MB per file (Images or PDF)
        </span>
      </div>

      {receipts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {receipts.map((url, index) => (
            <div 
              key={index}
              className="relative group border rounded-lg overflow-hidden"
            >
              {isImage(url) ? (
                <img 
                  src={url} 
                  alt={`Receipt ${index + 1}`}
                  className="w-20 h-20 object-cover"
                />
              ) : (
                <div className="w-20 h-20 flex items-center justify-center bg-muted">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-7 w-7 text-white hover:text-white"
                      onClick={() => setPreviewUrl(url)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Receipt Preview</DialogTitle>
                    </DialogHeader>
                    {isImage(url) ? (
                      <img 
                        src={url} 
                        alt="Receipt preview"
                        className="w-full max-h-[70vh] object-contain"
                      />
                    ) : (
                      <iframe 
                        src={url}
                        className="w-full h-[70vh]"
                        title="PDF Preview"
                      />
                    )}
                  </DialogContent>
                </Dialog>
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-7 w-7 text-white hover:text-red-400"
                  onClick={() => removeReceipt(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
