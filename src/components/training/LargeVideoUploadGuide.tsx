import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoIcon, CloudUpload, HardDrive, Timer } from 'lucide-react';

export function LargeVideoUploadGuide() {
  const [showTips, setShowTips] = useState(false);

  return (
    <div className="space-y-4">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertDescription>
          For best results with large video files (GB-sized), consider these options:
          <button 
            onClick={() => setShowTips(!showTips)}
            className="ml-2 text-primary hover:underline"
          >
            {showTips ? 'Hide' : 'Show'} tips
          </button>
        </AlertDescription>
      </Alert>

      {showTips && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <CloudUpload className="h-4 w-4" />
                Cloud Storage
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              <p>Upload to YouTube, Vimeo, or Google Drive first, then use the video URL for faster loading.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <HardDrive className="h-4 w-4" />
                File Size
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              <p>Consider compressing videos to reduce file size while maintaining quality (H.264 codec recommended).</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Timer className="h-4 w-4" />
                Upload Time
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              <p>Large files may take 10-30 minutes to upload. Keep the browser tab open during upload.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}