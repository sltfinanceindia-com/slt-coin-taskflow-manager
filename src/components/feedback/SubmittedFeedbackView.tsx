import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, Star, Calendar, Clock, Share2, MessageCircle, Download } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

interface SubmittedFeedbackViewProps {
  feedbackData: {
    id: string;
    user_email: string;
    user_name: string;
    response_data: any;
    submission_date: string;
    completion_time_seconds: number | null;
  };
}

export default function SubmittedFeedbackView({ feedbackData }: SubmittedFeedbackViewProps) {
  const data = feedbackData.response_data || {};
  const cardRef = useRef<HTMLDivElement>(null);
  const WHATSAPP_NUMBER = '919948397386';

  const handleDownloadScreenshot = async () => {
    if (!cardRef.current) return;
    
    try {
      toast.loading('Generating screenshot...');
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `slt-feedback-${feedbackData.user_name.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast.dismiss();
      toast.success('Screenshot downloaded! Send it to WhatsApp.');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate screenshot');
      console.error('Screenshot error:', error);
    }
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi! I've completed the SLT Work Hub feedback survey.\n\n` +
      `📧 Email: ${feedbackData.user_email}\n` +
      `👤 Name: ${feedbackData.user_name}\n` +
      `📅 Submitted: ${format(new Date(feedbackData.submission_date), 'MMM d, yyyy')}\n\n` +
      `I've shared with friends and attached my feedback screenshot for verification.`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  const handleShare = async () => {
    const shareText = `🚀 I just submitted my feedback for SLT Work Hub - an amazing platform for task management, team communication, and workforce management!\n\nCheck it out: ${window.location.origin}`;

    try {
      // Try native share API first (works on mobile)
      if (navigator.share && navigator.canShare?.({ text: shareText })) {
        await navigator.share({
          title: 'SLT Work Hub - Amazing Work Management Platform',
          text: shareText,
        });
        toast.success('Thanks for sharing!');
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        toast.success('Link copied to clipboard! Share with your friends.');
      }
    } catch (error: any) {
      // If share was cancelled or failed, try clipboard
      if (error.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(shareText);
          toast.success('Link copied to clipboard! Share with your friends.');
        } catch {
          toast.error('Could not copy link. Please share manually.');
        }
      }
    }
  };

  const renderStars = (rating: number | undefined) => {
    if (!rating) return <span className="text-muted-foreground text-sm">Not rated</span>;
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const renderField = (label: string, value: any) => {
    if (value === undefined || value === null || value === '') return null;
    return (
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</p>
      </div>
    );
  };

  const renderFeatureRating = (category: string, label: string) => {
    const feature = data.features?.[category];
    if (!feature || Object.keys(feature).length === 0) return null;

    return (
      <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
        <h4 className="font-medium text-sm">{label}</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {feature.usage_frequency && (
            <div>
              <span className="text-muted-foreground">Usage: </span>
              {feature.usage_frequency}
            </div>
          )}
          {feature.satisfaction !== undefined && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Rating: </span>
              {renderStars(feature.satisfaction)}
            </div>
          )}
          {feature.comments && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Comments: </span>
              {feature.comments}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg" ref={cardRef}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Your Submitted Feedback
          </CardTitle>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Submitted
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {format(new Date(feedbackData.submission_date), 'MMM d, yyyy')}
          </span>
          {feedbackData.completion_time_seconds && (
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {Math.floor(feedbackData.completion_time_seconds / 60)} min
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-indigo-600 uppercase tracking-wide">Profile</h3>
              <div className="grid grid-cols-2 gap-3">
                {renderField('Role', data.role)}
                {renderField('Company Size', data.companySize)}
                {renderField('Industry', data.industry)}
                {renderField('Usage Duration', data.usageDuration)}
              </div>
            </div>

            <Separator />

            {/* Overall Experience */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-indigo-600 uppercase tracking-wide">Overall Experience</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Satisfaction</p>
                  {renderStars(data.overall_satisfaction)}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">NPS Score</p>
                  <Badge variant="outline" className="text-lg font-bold">
                    {data.nps_score !== undefined ? data.nps_score : '-'}/10
                  </Badge>
                </div>
                {renderField('Comparison', data.comparison)}
                {renderField('First Impression', data.first_impression)}
              </div>
            </div>

            <Separator />

            {/* Onboarding */}
            {(data.setup_ease || data.training_quality || data.documentation_quality) && (
              <>
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-indigo-600 uppercase tracking-wide">Onboarding</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {renderField('Setup Ease', data.setup_ease)}
                    {renderField('Training Quality', data.training_quality)}
                    {renderField('Documentation Quality', data.documentation_quality)}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Feature Ratings */}
            {data.features && Object.keys(data.features).some(k => Object.keys(data.features[k] || {}).length > 0) && (
              <>
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-indigo-600 uppercase tracking-wide">Feature Ratings</h3>
                  <div className="space-y-2">
                    {renderFeatureRating('tasks', 'Task Management')}
                    {renderFeatureRating('coins', 'Coin System')}
                    {renderFeatureRating('communication', 'Communication')}
                    {renderFeatureRating('workforce', 'Workforce Management')}
                    {renderFeatureRating('performance', 'Performance Tracking')}
                    {renderFeatureRating('training', 'Training Center')}
                    {renderFeatureRating('analytics', 'Analytics')}
                    {renderFeatureRating('admin', 'Admin Features')}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Pain Points & Requests */}
            {(data.biggest_pain_points || data.feature_requests) && (
              <>
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-indigo-600 uppercase tracking-wide">Feedback Details</h3>
                  {data.biggest_pain_points && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Pain Points</p>
                      <p className="text-sm bg-muted/50 p-2 rounded">{data.biggest_pain_points}</p>
                    </div>
                  )}
                  {data.feature_requests && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Feature Requests</p>
                      <p className="text-sm bg-muted/50 p-2 rounded">{data.feature_requests}</p>
                    </div>
                  )}
                </div>
                <Separator />
              </>
            )}

            {/* Final Thoughts */}
            {(data.testimonial || data.additional_comments) && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-indigo-600 uppercase tracking-wide">Final Thoughts</h3>
                {data.testimonial && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Testimonial</p>
                    <p className="text-sm italic bg-muted/50 p-2 rounded">"{data.testimonial}"</p>
                  </div>
                )}
                {data.additional_comments && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Additional Comments</p>
                    <p className="text-sm bg-muted/50 p-2 rounded">{data.additional_comments}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-3 pt-4 border-t">
        <p className="text-sm text-muted-foreground text-center">
          Share with 2+ friends & send screenshot to claim your reward
        </p>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <Button onClick={handleShare} variant="outline" className="flex-1">
            <Share2 className="h-4 w-4 mr-2" />
            Share with Friends
          </Button>
          <Button onClick={handleDownloadScreenshot} variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download Screenshot
          </Button>
          <Button onClick={openWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700">
            <MessageCircle className="h-4 w-4 mr-2" />
            Send to WhatsApp
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
