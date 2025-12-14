import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScratchCard } from '@/types/feedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';
import { useIsSuperAdmin } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';
import SuperAdminLayout from '@/components/super-admin/SuperAdminLayout';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  TrendingUp, 
  Users, 
  Gift, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  Search,
  FileText,
  Eye,
  Star,
  MessageSquare,
  Building,
  Calendar,
  Mail,
  Phone,
  Briefcase,
  Target,
  DollarSign,
  ThumbsUp,
  ThumbsDown,
  AlertCircle
} from 'lucide-react';

interface FeedbackStats {
  total_responses: number;
  avg_satisfaction: number;
  avg_nps: number;
  would_pay_count: number;
  unique_referral_sources: number;
  referred_users: number;
}

interface ScratchCardStats {
  card_type: 'high_value' | 'medium_value' | 'better_luck';
  total_issued: number;
  scratched_count: number;
  verified_count: number;
  pending_count: number;
  total_value: number;
  paid_value: number;
}

interface FeedbackResponse {
  id: string;
  user_email: string;
  user_name: string;
  user_phone: string | null;
  response_data: any;
  submission_date: string;
  referral_source: string | null;
  referred_by_name: string | null;
  completion_time_seconds: number | null;
  created_at: string;
}

export default function FeedbackRewards() {
  const { isSuperAdmin, isLoading: roleLoading } = useIsSuperAdmin();
  const { loading: authLoading } = useAuth();
  
  const [pendingCards, setPendingCards] = useState<ScratchCard[]>([]);
  const [verifiedCards, setVerifiedCards] = useState<ScratchCard[]>([]);
  const [rejectedCards, setRejectedCards] = useState<ScratchCard[]>([]);
  const [expiredCards, setExpiredCards] = useState<ScratchCard[]>([]);
  const [feedbackResponses, setFeedbackResponses] = useState<FeedbackResponse[]>([]);
  
  const [selectedCard, setSelectedCard] = useState<ScratchCard | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackResponse | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackSearchQuery, setFeedbackSearchQuery] = useState('');
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
  const [scratchCardStats, setScratchCardStats] = useState<ScratchCardStats[]>([]);

  useEffect(() => {
    if (isSuperAdmin && !roleLoading) {
      fetchAllData();
    }
  }, [isSuperAdmin, roleLoading]);

  const fetchAllData = async () => {
    await Promise.all([
      fetchPendingCards(),
      fetchVerifiedCards(),
      fetchRejectedCards(),
      fetchExpiredCards(),
      fetchFeedbackStats(),
      fetchScratchCardStats(),
      fetchFeedbackResponses()
    ]);
  };

  const fetchFeedbackResponses = async () => {
    const { data, error } = await supabase
      .from('feedback_responses')
      .select('*')
      .order('submission_date', { ascending: false });

    if (error) {
      console.error('Error fetching feedback responses:', error);
      toast.error('Failed to load feedback responses');
      return;
    }

    setFeedbackResponses(data || []);
  };

  const fetchPendingCards = async () => {
    const { data, error } = await supabase
      .from('scratch_cards')
      .select('*')
      .eq('verification_status', 'pending')
      .gt('card_value', 0)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending cards:', error);
      return;
    }

    setPendingCards(data || []);
  };

  const fetchVerifiedCards = async () => {
    const { data, error } = await supabase
      .from('scratch_cards')
      .select('*')
      .eq('verification_status', 'verified')
      .order('verified_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching verified cards:', error);
      return;
    }

    setVerifiedCards(data || []);
  };

  const fetchRejectedCards = async () => {
    const { data, error } = await supabase
      .from('scratch_cards')
      .select('*')
      .eq('verification_status', 'rejected')
      .order('verified_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching rejected cards:', error);
      return;
    }

    setRejectedCards(data || []);
  };

  const fetchExpiredCards = async () => {
    const { data, error } = await supabase
      .from('scratch_cards')
      .select('*')
      .eq('verification_status', 'expired')
      .order('expiry_date', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching expired cards:', error);
      return;
    }

    setExpiredCards(data || []);
  };

  const fetchFeedbackStats = async () => {
    const { data, error } = await supabase
      .from('feedback_analytics')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching feedback stats:', error);
      return;
    }

    setFeedbackStats(data);
  };

  const fetchScratchCardStats = async () => {
    const { data, error } = await supabase
      .from('scratch_card_stats')
      .select('*');

    if (error) {
      console.error('Error fetching scratch card stats:', error);
      return;
    }

    setScratchCardStats(data || []);
  };

  const verifyCard = async (cardId: string, status: 'verified' | 'rejected') => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.rpc('verify_scratch_card', {
        p_card_id: cardId,
        p_verified_by: user.id,
        p_status: status,
        p_notes: verificationNotes
      });

      if (error) throw error;

      toast.success(`Card ${status === 'verified' ? 'approved ✅' : 'rejected ❌'} successfully`);
      
      setSelectedCard(null);
      setVerificationNotes('');
      await fetchAllData();
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error('Failed to verify card: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (cards: ScratchCard[], filename: string) => {
    const headers = ['Name', 'Email', 'Phone', 'Prize Amount', 'Card Code', 'Status', 'Date', 'Notes'];
    const rows = cards.map(card => [
      card.user_name,
      card.user_email,
      card.user_phone || 'N/A',
      `₹${card.card_value}`,
      card.card_code || 'N/A',
      card.verification_status,
      new Date(card.created_at).toLocaleDateString(),
      card.verification_notes || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportFeedbackToCSV = () => {
    const headers = [
      'Name', 'Email', 'Phone', 'Role', 'Company Size', 'Industry', 'Usage Duration',
      'Satisfaction', 'NPS', 'Comparison', 'First Impression',
      'Signup Ease', 'Wizard Completion', 'Time to First Action',
      'Navigation Ease', 'Design Feeling', 'Mobile Experience', 'Load Speed',
      'Encountered Bugs', 'Would Pay', 'Fair Price', 'Pricing Model',
      'Love Most', 'Biggest Complaint', 'Would Use If',
      'Referral Source', 'Referred By', 'Submission Date', 'Completion Time (sec)'
    ];
    
    const rows = feedbackResponses.map(fb => {
      const data = fb.response_data || {};
      return [
        fb.user_name,
        fb.user_email,
        fb.user_phone || 'N/A',
        data.role || 'N/A',
        data.companySize || 'N/A',
        data.industry || 'N/A',
        data.usageDuration || 'N/A',
        data.overall_satisfaction || 'N/A',
        data.nps_score || 'N/A',
        data.comparison || 'N/A',
        data.first_impression || 'N/A',
        data.signup_ease || 'N/A',
        data.wizard_completion || 'N/A',
        data.time_to_first_action || 'N/A',
        data.navigation_ease || 'N/A',
        data.design_feeling || 'N/A',
        data.mobile_experience || 'N/A',
        data.load_speed || 'N/A',
        data.encountered_bugs || 'N/A',
        data.would_pay || 'N/A',
        data.fair_price || 'N/A',
        data.pricing_model || 'N/A',
        (data.love_most || '').replace(/"/g, '""'),
        (data.biggest_complaint || '').replace(/"/g, '""'),
        (data.would_use_if || '').replace(/"/g, '""'),
        fb.referral_source || 'N/A',
        fb.referred_by_name || 'N/A',
        new Date(fb.submission_date).toLocaleDateString(),
        fb.completion_time_seconds || 'N/A'
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-responses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Feedback exported successfully');
  };

  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const filteredPendingCards = pendingCards.filter(card =>
    card.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.user_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFeedback = feedbackResponses.filter(fb =>
    fb.user_name.toLowerCase().includes(feedbackSearchQuery.toLowerCase()) ||
    fb.user_email.toLowerCase().includes(feedbackSearchQuery.toLowerCase()) ||
    (fb.response_data?.role || '').toLowerCase().includes(feedbackSearchQuery.toLowerCase()) ||
    (fb.response_data?.industry || '').toLowerCase().includes(feedbackSearchQuery.toLowerCase())
  );

  const renderStars = (rating: number) => {
    if (!rating || rating === -1) return <span className="text-xs text-muted-foreground">N/A</span>;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            className={`h-3 w-3 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} 
          />
        ))}
      </div>
    );
  };

  const renderNPSBadge = (score: number) => {
    if (score === undefined || score === null) return <Badge variant="secondary">N/A</Badge>;
    
    let variant: 'default' | 'secondary' | 'destructive' = 'secondary';
    let label = 'Passive';
    
    if (score >= 9) {
      variant = 'default';
      label = 'Promoter';
    } else if (score <= 6) {
      variant = 'destructive';
      label = 'Detractor';
    }
    
    return (
      <div className="flex flex-col items-center gap-1">
        <Badge variant={variant} className="font-bold">{score}/10</Badge>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    );
  };

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: any }) => (
    <div className="flex items-start gap-3 py-2 border-b last:border-0">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || 'N/A'}</p>
      </div>
    </div>
  );

  const FeatureRatingSection = ({ title, features }: { title: string; features: any }) => {
    if (!features || Object.keys(features).length === 0) return null;
    
    return (
      <div className="space-y-2">
        <h5 className="font-semibold text-sm">{title}</h5>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(features).map(([key, value]: [string, any]) => {
            if (key === 'feedback' || key === 'motivation' || key === 'preference' || key === 'mostValuable' || 
                key === 'helpfulness' || key === 'primaryPlatform' || key === 'usefulness') {
              if (typeof value === 'string' && value) {
                return (
                  <div key={key} className="text-sm p-2 bg-muted/50 rounded">
                    <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                    <span className="font-medium">{value}</span>
                  </div>
                );
              }
              return null;
            }
            
            if (typeof value === 'number') {
              return (
                <div key={key} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  {renderStars(value)}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  };

  return (
    <SuperAdminLayout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Feedback & Rewards Management</h1>
          <p className="text-muted-foreground">Manage user feedback and scratch card verifications</p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feedbackResponses.length}</div>
              <p className="text-xs text-muted-foreground">
                {feedbackStats?.referred_users || 0} via referral
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg NPS Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {feedbackStats?.avg_nps?.toFixed(1) || '0.0'}/10
              </div>
              <p className="text-xs text-muted-foreground">
                Satisfaction: {feedbackStats?.avg_satisfaction?.toFixed(1) || '0.0'}/5
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingCards.length}</div>
              <p className="text-xs text-muted-foreground">
                Total value: ₹{pendingCards.reduce((sum, card) => sum + card.card_value, 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Payout</CardTitle>
              <Gift className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{scratchCardStats.reduce((sum, stat) => sum + stat.paid_value, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {verifiedCards.length} cards verified
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Scratch Card Stats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Scratch Card Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scratchCardStats.map(stat => (
                <div key={stat.card_type} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2 capitalize">
                    {stat.card_type.replace('_', ' ')}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Issued:</span>
                      <span className="font-medium">{stat.total_issued}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Scratched:</span>
                      <span className="font-medium">{stat.scratched_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Verified:</span>
                      <span className="font-medium text-green-600">{stat.verified_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pending:</span>
                      <span className="font-medium text-yellow-600">{stat.pending_count}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 mt-2">
                      <span className="text-muted-foreground">Paid:</span>
                      <span className="font-bold text-green-600">₹{stat.paid_value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="feedback" className="space-y-4">
          <TabsList>
            <TabsTrigger value="feedback">
              <FileText className="h-4 w-4 mr-2" />
              All Feedback ({feedbackResponses.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending Cards ({pendingCards.length})
            </TabsTrigger>
            <TabsTrigger value="verified">
              Verified ({verifiedCards.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedCards.length})
            </TabsTrigger>
            <TabsTrigger value="expired">
              Expired ({expiredCards.length})
            </TabsTrigger>
          </TabsList>

          {/* FEEDBACK TAB - COMPLETE */}
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>All Feedback Responses ({feedbackResponses.length})</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search feedback..."
                        value={feedbackSearchQuery}
                        onChange={(e) => setFeedbackSearchQuery(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={exportFeedbackToCSV}>
                      <Download className="h-4 w-4 mr-2" />
                      Export All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User Details</TableHead>
                        <TableHead>Company Profile</TableHead>
                        <TableHead>Ratings</TableHead>
                        <TableHead>Referral</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFeedback.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            {feedbackSearchQuery ? 'No feedback matches your search' : 'No feedback responses yet'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredFeedback.map(fb => {
                          const data = fb.response_data || {};
                          return (
                            <TableRow key={fb.id}>
                              <TableCell>
                                <div className="space-y-1">
                                  <p className="font-medium">{fb.user_name}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {fb.user_email}
                                  </p>
                                  {fb.user_phone && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {fb.user_phone}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <Badge variant="outline" className="capitalize mb-1">
                                    {data.role?.replace('_', ' ') || 'N/A'}
                                  </Badge>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Building className="h-3 w-3" />
                                    {data.companySize || 'N/A'}
                                  </p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Briefcase className="h-3 w-3" />
                                    {data.industry || 'N/A'}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">Satisfaction</p>
                                    {renderStars(data.overall_satisfaction)}
                                  </div>
                                  <div>
                                    <p className="text-xs text-muted-foreground mb-1">NPS</p>
                                    {renderNPSBadge(data.nps_score)}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {fb.referral_source ? (
                                    <>
                                      <p className="text-xs text-muted-foreground mb-1">Source</p>
                                      <p className="font-medium text-xs">{fb.referral_source}</p>
                                      {fb.referred_by_name && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          By: {fb.referred_by_name}
                                        </p>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">N/A</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <p className="font-medium">
                                    {new Date(fb.submission_date).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(fb.submission_date).toLocaleTimeString('en-IN', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                  {fb.completion_time_seconds && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      ⏱️ {Math.floor(fb.completion_time_seconds / 60)}m {fb.completion_time_seconds % 60}s
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setSelectedFeedback(fb)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View All
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PENDING CARDS TAB */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Pending Verification</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={() => exportToCSV(pendingCards, 'pending-cards.csv')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPendingCards.map(card => (
                    <div key={card.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-lg">{card.user_name}</p>
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                              ₹{card.card_value}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{card.user_email}</p>
                          {card.user_phone && <p className="text-sm text-muted-foreground mb-1">{card.user_phone}</p>}
                          <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                            <span>
                              {new Date(card.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                            <span className="capitalize">Type: {card.card_type.replace('_', ' ')}</span>
                            <span>Expires: {new Date(card.expiry_date).toLocaleDateString('en-IN')}</span>
                          </div>
                        </div>
                        <Button onClick={() => setSelectedCard(card)} variant="outline" size="sm">
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}

                  {filteredPendingCards.length === 0 && (
                    <div className="text-center py-12">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery ? 'No cards match your search' : 'No pending verifications'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* VERIFIED CARDS TAB */}
          <TabsContent value="verified">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Verified Cards</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => exportToCSV(verifiedCards, 'verified-cards.csv')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {verifiedCards.map(card => (
                    <div key={card.id} className="border rounded-lg p-3 bg-green-50/50 dark:bg-green-950/20">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{card.user_name}</p>
                          <p className="text-sm text-muted-foreground">{card.user_email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Code: <span className="font-mono font-bold">{card.card_code}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-600">₹{card.card_value}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {card.verified_at && new Date(card.verified_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {card.verification_notes && (
                        <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                          Note: {card.verification_notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REJECTED CARDS TAB */}
          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle>Rejected Cards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rejectedCards.map(card => (
                    <div key={card.id} className="border rounded-lg p-3 bg-red-50/50 dark:bg-red-950/20">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{card.user_name}</p>
                          <p className="text-sm text-muted-foreground">{card.user_email}</p>
                        </div>
                        <Badge variant="destructive">Rejected</Badge>
                      </div>
                      {card.verification_notes && (
                        <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                          Reason: {card.verification_notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EXPIRED CARDS TAB */}
          <TabsContent value="expired">
            <Card>
              <CardHeader>
                <CardTitle>Expired Cards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expiredCards.map(card => (
                    <div key={card.id} className="border rounded-lg p-3 bg-muted/50">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{card.user_name}</p>
                          <p className="text-sm text-muted-foreground">{card.user_email}</p>
                        </div>
                        <Badge variant="secondary">Expired</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* SCRATCH CARD REVIEW MODAL */}
        {selectedCard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Review Scratch Card Claim</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-semibold">{selectedCard.user_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold text-sm">{selectedCard.user_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-semibold">{selectedCard.user_phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prize Amount</p>
                    <p className="font-semibold text-green-600 text-xl">₹{selectedCard.card_value}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Card Type</p>
                    <p className="font-semibold capitalize">{selectedCard.card_type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Submitted</p>
                    <p className="font-semibold text-sm">
                      {new Date(selectedCard.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Verification Notes *</label>
                  <Textarea
                    placeholder="Document verification details (screenshots verified, review checked, etc.)"
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Verification Checklist:</p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>✓ Verify 3-5 genuine shares on WhatsApp/Social media</li>
                    <li>✓ Check authentic review (not copy-paste)</li>
                    <li>✓ Confirm WhatsApp submission to +91 9948397386</li>
                    <li>✓ Document verification in notes above</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => verifyCard(selectedCard.id, 'verified')}
                    disabled={loading || !verificationNotes.trim()}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {loading ? 'Processing...' : 'Approve & Send Code'}
                  </Button>
                  <Button
                    onClick={() => verifyCard(selectedCard.id, 'rejected')}
                    disabled={loading || !verificationNotes.trim()}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Claim
                  </Button>
                </div>

                <Button
                  onClick={() => {
                    setSelectedCard(null);
                    setVerificationNotes('');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* COMPLETE FEEDBACK DETAIL DIALOG */}
        <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Complete Feedback Details
              </DialogTitle>
            </DialogHeader>
            
            {selectedFeedback && (
              <div className="space-y-6">
                {/* USER INFO CARD */}
                <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <InfoRow icon={Users} label="Name" value={selectedFeedback.user_name} />
                      <InfoRow icon={Mail} label="Email" value={selectedFeedback.user_email} />
                      <InfoRow icon={Phone} label="Phone" value={selectedFeedback.user_phone} />
                      <InfoRow 
                        icon={Calendar} 
                        label="Submitted" 
                        value={new Date(selectedFeedback.submission_date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })} 
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* ACCORDION FOR ALL SECTIONS */}
                <Accordion type="multiple" defaultValue={['section1', 'section2']} className="w-full">
                  {/* SECTION 1: USER PROFILE */}
                  <AccordionItem value="section1">
                    <AccordionTrigger className="text-lg font-semibold">
                      📋 Section 1: User Profile
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-muted/50 rounded-lg">
                        <InfoRow icon={Briefcase} label="Role" value={selectedFeedback.response_data?.role} />
                        <InfoRow icon={Building} label="Company Size" value={selectedFeedback.response_data?.companySize} />
                        <InfoRow icon={Target} label="Industry" value={selectedFeedback.response_data?.industry} />
                        <InfoRow icon={Clock} label="Usage Duration" value={selectedFeedback.response_data?.usageDuration} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* SECTION 2: OVERALL EXPERIENCE */}
                  <AccordionItem value="section2">
                    <AccordionTrigger className="text-lg font-semibold">
                      ⭐ Section 2: Overall Experience
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border rounded-lg p-3">
                            <p className="text-sm text-muted-foreground mb-2">Overall Satisfaction</p>
                            <div className="flex items-center gap-2">
                              {renderStars(selectedFeedback.response_data?.overall_satisfaction)}
                              <span className="font-bold">
                                {selectedFeedback.response_data?.overall_satisfaction || 0}/5
                              </span>
                            </div>
                          </div>
                          <div className="border rounded-lg p-3">
                            <p className="text-sm text-muted-foreground mb-2">NPS Score</p>
                            {renderNPSBadge(selectedFeedback.response_data?.nps_score)}
                          </div>
                        </div>
                        <InfoRow icon={Target} label="Comparison to Other Tools" value={selectedFeedback.response_data?.comparison} />
                        <InfoRow icon={Star} label="First Impression" value={selectedFeedback.response_data?.first_impression} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* SECTION 3: ONBOARDING */}
                  <AccordionItem value="section3">
                    <AccordionTrigger className="text-lg font-semibold">
                      🚀 Section 3: Onboarding & Setup
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                        <div className="border rounded-lg p-3">
                          <p className="text-sm text-muted-foreground mb-2">Signup Ease</p>
                          {renderStars(selectedFeedback.response_data?.signup_ease)}
                        </div>
                        <InfoRow icon={CheckCircle} label="Wizard Completion" value={selectedFeedback.response_data?.wizard_completion} />
                        <InfoRow icon={Clock} label="Time to First Action" value={selectedFeedback.response_data?.time_to_first_action} />
                        {selectedFeedback.response_data?.onboarding_feedback && (
                          <div className="border-l-4 border-indigo-500 pl-4 py-2 bg-indigo-50 dark:bg-indigo-950">
                            <p className="text-sm text-muted-foreground mb-1">Onboarding Feedback</p>
                            <p className="text-sm">{selectedFeedback.response_data.onboarding_feedback}</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* SECTION 4: FEATURE RATINGS */}
                  <AccordionItem value="section4">
                    <AccordionTrigger className="text-lg font-semibold">
                      🎯 Section 4: Feature Ratings
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                        {selectedFeedback.response_data?.features?.tasks && (
                          <FeatureRatingSection title="📋 Task Management" features={selectedFeedback.response_data.features.tasks} />
                        )}
                        {selectedFeedback.response_data?.features?.coins && (
                          <FeatureRatingSection title="🪙 Coin System" features={selectedFeedback.response_data.features.coins} />
                        )}
                        {selectedFeedback.response_data?.features?.communication && (
                          <FeatureRatingSection title="💬 Communication" features={selectedFeedback.response_data.features.communication} />
                        )}
                        {selectedFeedback.response_data?.features?.workforce && (
                          <FeatureRatingSection title="👥 Workforce Management" features={selectedFeedback.response_data.features.workforce} />
                        )}
                        {selectedFeedback.response_data?.features?.performance && (
                          <FeatureRatingSection title="📊 Performance Management" features={selectedFeedback.response_data.features.performance} />
                        )}
                        {selectedFeedback.response_data?.features?.training && (
                          <FeatureRatingSection title="🎓 Training Center" features={selectedFeedback.response_data.features.training} />
                        )}
                        {selectedFeedback.response_data?.features?.analytics && (
                          <FeatureRatingSection title="📈 Analytics & Reporting" features={selectedFeedback.response_data.features.analytics} />
                        )}
                        {selectedFeedback.response_data?.features?.admin && (
                          <FeatureRatingSection title="⚙️ Admin Features" features={selectedFeedback.response_data.features.admin} />
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* SECTION 5: USABILITY */}
                  <AccordionItem value="section5">
                    <AccordionTrigger className="text-lg font-semibold">
                      🎨 Section 5: Usability & Design
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="border rounded-lg p-3">
                            <p className="text-sm text-muted-foreground mb-2">Navigation Ease</p>
                            {renderStars(selectedFeedback.response_data?.navigation_ease)}
                          </div>
                          <div className="border rounded-lg p-3">
                            <p className="text-sm text-muted-foreground mb-2">Mobile Experience</p>
                            {renderStars(selectedFeedback.response_data?.mobile_experience)}
                          </div>
                        </div>
                        <InfoRow icon={Star} label="Design Feeling" value={selectedFeedback.response_data?.design_feeling} />
                        <InfoRow icon={TrendingUp} label="Load Speed" value={selectedFeedback.response_data?.load_speed} />
                        {selectedFeedback.response_data?.confusing_parts && (
                          <div className="border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-50 dark:bg-yellow-950">
                            <p className="text-sm text-muted-foreground mb-1">Confusing Parts</p>
                            <p className="text-sm">{selectedFeedback.response_data.confusing_parts}</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* SECTION 6: PAIN POINTS & BUGS */}
                  <AccordionItem value="section6">
                    <AccordionTrigger className="text-lg font-semibold">
                      🐛 Section 6: Pain Points & Bugs
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                        <InfoRow icon={AlertCircle} label="Encountered Bugs" value={selectedFeedback.response_data?.encountered_bugs} />
                        {selectedFeedback.response_data?.bug_description && (
                          <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 dark:bg-red-950">
                            <p className="text-sm text-muted-foreground mb-1">Bug Description</p>
                            <p className="text-sm">{selectedFeedback.response_data.bug_description}</p>
                          </div>
                        )}
                        {selectedFeedback.response_data?.frustrations && (
                          <div className="border-l-4 border-orange-500 pl-4 py-2 bg-orange-50 dark:bg-orange-950">
                            <p className="text-sm text-muted-foreground mb-1">Frustrations</p>
                            <p className="text-sm">{selectedFeedback.response_data.frustrations}</p>
                          </div>
                        )}
                        {selectedFeedback.response_data?.stuck_where && (
                          <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50 dark:bg-purple-950">
                            <p className="text-sm text-muted-foreground mb-1">Where They Got Stuck</p>
                            <p className="text-sm">{selectedFeedback.response_data.stuck_where}</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* SECTION 7: FEATURE REQUESTS */}
                  <AccordionItem value="section7">
                    <AccordionTrigger className="text-lg font-semibold">
                      💡 Section 7: Feature Requests
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                        {selectedFeedback.response_data?.missing_features && (
                          <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-950">
                            <p className="text-sm text-muted-foreground mb-1">Missing Features</p>
                            <p className="text-sm">{selectedFeedback.response_data.missing_features}</p>
                          </div>
                        )}
                        {selectedFeedback.response_data?.one_feature && (
                          <div className="border-l-4 border-indigo-500 pl-4 py-2 bg-indigo-50 dark:bg-indigo-950">
                            <p className="text-sm text-muted-foreground mb-1">Top Priority Feature</p>
                            <p className="text-sm font-semibold">{selectedFeedback.response_data.one_feature}</p>
                          </div>
                        )}
                        {selectedFeedback.response_data?.priority_improvement && (
                          <div className="border-l-4 border-violet-500 pl-4 py-2 bg-violet-50 dark:bg-violet-950">
                            <p className="text-sm text-muted-foreground mb-1">Priority Improvement</p>
                            <p className="text-sm">{selectedFeedback.response_data.priority_improvement}</p>
                          </div>
                        )}
                        {selectedFeedback.response_data?.unused_features && (
                          <div className="border-l-4 border-gray-500 pl-4 py-2 bg-gray-50 dark:bg-gray-950">
                            <p className="text-sm text-muted-foreground mb-1">Unused Features</p>
                            <p className="text-sm">{selectedFeedback.response_data.unused_features}</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* SECTION 8: COMPARISON */}
                  <AccordionItem value="section8">
                    <AccordionTrigger className="text-lg font-semibold">
                      🔄 Section 8: Comparison & Value
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                        {selectedFeedback.response_data?.previous_tools && (
                          <div className="border rounded-lg p-3">
                            <p className="text-sm text-muted-foreground mb-2">Previous Tools</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedFeedback.response_data.previous_tools.map((tool: string) => (
                                <Badge key={tool} variant="outline">{tool}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <InfoRow icon={Target} label="Replaced Tools" value={selectedFeedback.response_data?.replaced_tools} />
                        {selectedFeedback.response_data?.does_better && (
                          <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 dark:bg-green-950">
                            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                              <ThumbsUp className="h-4 w-4" />
                              What We Do Better
                            </p>
                            <p className="text-sm">{selectedFeedback.response_data.does_better}</p>
                          </div>
                        )}
                        {selectedFeedback.response_data?.others_do_better && (
                          <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 dark:bg-red-950">
                            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                              <ThumbsDown className="h-4 w-4" />
                              Where Others Are Better
                            </p>
                            <p className="text-sm">{selectedFeedback.response_data.others_do_better}</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* SECTION 9: PRICING */}
                  <AccordionItem value="section9">
                    <AccordionTrigger className="text-lg font-semibold">
                      💰 Section 9: Pricing & Business Decision
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="border rounded-lg p-3">
                            <p className="text-sm text-muted-foreground mb-1">Would Pay?</p>
                            <Badge variant={
                              selectedFeedback.response_data?.would_pay?.includes('definitely') ? 'default' :
                              selectedFeedback.response_data?.would_pay?.includes('No') ? 'destructive' : 'secondary'
                            }>
                              {selectedFeedback.response_data?.would_pay || 'N/A'}
                            </Badge>
                          </div>
                          <InfoRow icon={DollarSign} label="Fair Price" value={selectedFeedback.response_data?.fair_price} />
                          <InfoRow icon={Target} label="Pricing Model" value={selectedFeedback.response_data?.pricing_model} />
                        </div>
                        {selectedFeedback.response_data?.upgrade_for && (
                          <div className="border rounded-lg p-3">
                            <p className="text-sm text-muted-foreground mb-2">Would Upgrade For</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedFeedback.response_data.upgrade_for.map((item: string) => (
                                <Badge key={item} variant="outline">{item}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* SECTION 10: FINAL THOUGHTS */}
                  <AccordionItem value="section10">
                    <AccordionTrigger className="text-lg font-semibold">
                      💭 Section 10: Final Thoughts
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                        {selectedFeedback.response_data?.love_most && (
                          <div className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 dark:bg-green-950">
                            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                              <Star className="h-4 w-4" />
                              What They Love Most
                            </p>
                            <p className="text-sm font-medium">{selectedFeedback.response_data.love_most}</p>
                          </div>
                        )}
                        {selectedFeedback.response_data?.biggest_complaint && (
                          <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 dark:bg-red-950">
                            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              Biggest Complaint
                            </p>
                            <p className="text-sm font-medium">{selectedFeedback.response_data.biggest_complaint}</p>
                          </div>
                        )}
                        {selectedFeedback.response_data?.would_use_if && (
                          <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-950">
                            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              "I would use every day if it could..."
                            </p>
                            <p className="text-sm font-medium">{selectedFeedback.response_data.would_use_if}</p>
                          </div>
                        )}
                        {selectedFeedback.response_data?.other_feedback && (
                          <div className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50 dark:bg-purple-950">
                            <p className="text-sm text-muted-foreground mb-1">Other Feedback</p>
                            <p className="text-sm">{selectedFeedback.response_data.other_feedback}</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* SECTION 11: REFERRAL */}
                  <AccordionItem value="section11">
                    <AccordionTrigger className="text-lg font-semibold">
                      🔗 Section 11: Referral Source
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                        <InfoRow icon={Target} label="How They Heard About Us" value={selectedFeedback.referral_source} />
                        {selectedFeedback.referred_by_name && (
                          <div className="border-l-4 border-indigo-500 pl-4 py-2 bg-indigo-50 dark:bg-indigo-950">
                            <p className="text-sm text-muted-foreground mb-1">Referred By</p>
                            <p className="text-sm font-semibold">{selectedFeedback.referred_by_name}</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* SECTION 12: FOLLOW-UP */}
                  <AccordionItem value="section12">
                    <AccordionTrigger className="text-lg font-semibold">
                      📞 Section 12: Follow-up Preferences
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="border rounded-lg p-3">
                            <p className="text-sm text-muted-foreground mb-1">Interview Willing</p>
                            <Badge variant={selectedFeedback.response_data?.allow_interview ? 'default' : 'secondary'}>
                              {selectedFeedback.response_data?.allow_interview ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                          <div className="border rounded-lg p-3">
                            <p className="text-sm text-muted-foreground mb-1">Want Updates</p>
                            <Badge variant={selectedFeedback.response_data?.notify_features ? 'default' : 'secondary'}>
                              {selectedFeedback.response_data?.notify_features ? 'Yes' : 'No'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </SuperAdminLayout>
  );
}
