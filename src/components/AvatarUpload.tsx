import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Upload, AlertCircle } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { validateFile, AllowedFileTypes, MaxFileSizes } from '@/utils/security';
import { toast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  userName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarUpload({ currentAvatarUrl, userName, size = 'md' }: AvatarUploadProps) {
  const { uploadAvatar, isUploadingAvatar } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-32 w-32'
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Comprehensive security validation
    const validation = validateFile(file, AllowedFileTypes.images, MaxFileSizes.avatar);
    
    if (!validation.isValid) {
      toast({
        title: "File Upload Error",
        description: validation.errors.join(', '),
        variant: "destructive",
      });
      return;
    }

    // Additional security check for file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      // Basic check for image file signature
      if (!result.startsWith('data:image/')) {
        toast({
          title: "Invalid File",
          description: "File does not appear to be a valid image",
          variant: "destructive",
        });
        return;
      }
      
      setPreview(result);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadAvatar(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const displayAvatar = preview || currentAvatarUrl;
  const initials = userName?.split(' ').map(n => n[0]).join('') || 'U';

  return (
    <div className="relative group">
      <Avatar className={`${sizeClasses[size]} cursor-pointer transition-opacity group-hover:opacity-80`}>
        <AvatarImage src={displayAvatar} alt={userName || 'User'} />
        <AvatarFallback className="text-lg font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="sm"
          variant="secondary"
          onClick={triggerFileSelect}
          disabled={isUploadingAvatar}
          className="rounded-full"
        >
          {isUploadingAvatar ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <>
              <Camera className="h-4 w-4 mr-1" />
              {size === 'lg' ? 'Change' : ''}
            </>
          )}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}