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
  MessageSquare
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

  // Fetch data when super admin is confirmed
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
      .limit(50);

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
      .limit(50);

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
      .limit(50);

    if (error) {
      console.error('Error fetching expired cards:', error);
      return;
    }

    setExpiredCards(data || []);
  };

  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
  const [scratchCardStats, setScratchCardStats] = useState<ScratchCardStats[]>([]);

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

      if (status === 'verified') {
        await sendVerificationEmail(selectedCard!);
      }

      toast.success(`Card ${status === 'verified' ? 'approved' : 'rejected'} successfully`);
      
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

  const sendVerificationEmail = async (card: ScratchCard) => {
    console.log('Send email to:', card.user_email);
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
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Company Size', 'Industry', 'Satisfaction', 'NPS', 'Date'];
    const rows = feedbackResponses.map(fb => {
      const data = fb.response_data || {};
      return [
        fb.user_name,
        fb.user_email,
        fb.user_phone || 'N/A',
        data.role || 'N/A',
        data.companySize || 'N/A',
        data.industry || 'N/A',
        data.overall_satisfaction || 'N/A',
        data.nps_score || 'N/A',
        new Date(fb.submission_date).toLocaleDateString()
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
    a.download = 'feedback-responses.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
    fb.user_email.toLowerCase().includes(feedbackSearchQuery.toLowerCase())
  );

  const renderStars = (rating: number) => {
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

      {/* Tabs for different views */}
      <Tabs defaultValue="feedback" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feedback">
            <FileText className="h-4 w-4 mr-2" />
            Feedback ({feedbackResponses.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingCards.length})
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

        {/* Feedback Responses Tab */}
        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>All Feedback Responses</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={feedbackSearchQuery}
                      onChange={(e) => setFeedbackSearchQuery(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={exportFeedbackToCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Company Size</TableHead>
                      <TableHead>Satisfaction</TableHead>
                      <TableHead>NPS</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFeedback.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No feedback responses found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFeedback.map(fb => {
                        const data = fb.response_data || {};
                        return (
                          <TableRow key={fb.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{fb.user_name}</p>
                                <p className="text-xs text-muted-foreground">{fb.user_email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {data.role || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {data.companySize || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {data.overall_satisfaction ? renderStars(data.overall_satisfaction) : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={data.nps_score >= 9 ? 'default' : data.nps_score >= 7 ? 'secondary' : 'destructive'}>
                                {data.nps_score || 'N/A'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(fb.submission_date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedFeedback(fb)}
                              >
                                <Eye className="h-4 w-4" />
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

        {/* Pending Cards Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Pending Verification</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(pendingCards, 'pending-cards.csv')}
                  >
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
                        {card.user_phone && (
                          <p className="text-sm text-muted-foreground mb-1">{card.user_phone}</p>
                        )}
                        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                          <span>
                            Submitted: {new Date(card.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="capitalize">Type: {card.card_type.replace('_', ' ')}</span>
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

        {/* Verified Cards Tab */}
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

        {/* Rejected Cards Tab */}
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

        {/* Expired Cards Tab */}
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

      {/* Review Scratch Card Modal */}
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
                  placeholder="Add verification notes..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => verifyCard(selectedCard.id, 'verified')}
                  disabled={loading || !verificationNotes.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {loading ? 'Processing...' : 'Approve'}
                </Button>
                <Button
                  onClick={() => verifyCard(selectedCard.id, 'rejected')}
                  disabled={loading || !verificationNotes.trim()}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
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

      {/* Feedback Detail Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-muted rounded-lg p-4">
                <h4 className="font-semibold mb-3">User Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-2 font-medium">{selectedFeedback.user_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2 font-medium">{selectedFeedback.user_email}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="ml-2 font-medium">{selectedFeedback.user_phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedFeedback.submission_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div>
                <h4 className="font-semibold mb-3">Profile</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="border rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Role</p>
                    <Badge variant="outline" className="capitalize">
                      {selectedFeedback.response_data?.role || 'N/A'}
                    </Badge>
                  </div>
                  <div className="border rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Company Size</p>
                    <p className="font-medium text-sm">{selectedFeedback.response_data?.companySize || 'N/A'}</p>
                  </div>
                  <div className="border rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Industry</p>
                    <p className="font-medium text-sm">{selectedFeedback.response_data?.industry || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Ratings */}
              <div>
                <h4 className="font-semibold mb-3">Overall Ratings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-2">Satisfaction</p>
                    <div className="flex items-center gap-2">
                      {renderStars(selectedFeedback.response_data?.overall_satisfaction || 0)}
                      <span className="text-sm font-medium">
                        {selectedFeedback.response_data?.overall_satisfaction || 0}/5
                      </span>
                    </div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-2">NPS Score</p>
                    <Badge 
                      variant={
                        (selectedFeedback.response_data?.nps_score || 0) >= 9 ? 'default' : 
                        (selectedFeedback.response_data?.nps_score || 0) >= 7 ? 'secondary' : 'destructive'
                      }
                      className="text-lg px-3"
                    >
                      {selectedFeedback.response_data?.nps_score || 0}/10
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Feature Ratings */}
              {selectedFeedback.response_data?.feature_ratings && (
                <div>
                  <h4 className="font-semibold mb-3">Feature Ratings</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedFeedback.response_data.feature_ratings).map(([feature, data]: [string, any]) => (
                      <div key={feature} className="flex items-center justify-between border rounded p-2">
                        <span className="capitalize text-sm">{feature.replace(/_/g, ' ')}</span>
                        <div className="flex items-center gap-2">
                          {renderStars(data?.rating || 0)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pain Points & Suggestions */}
              <div className="grid grid-cols-1 gap-4">
                {selectedFeedback.response_data?.pain_points && (
                  <div className="border rounded-lg p-3">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Pain Points
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedFeedback.response_data.pain_points}
                    </p>
                  </div>
                )}
                {selectedFeedback.response_data?.suggestions && (
                  <div className="border rounded-lg p-3">
                    <h4 className="font-semibold text-sm mb-2">Suggestions</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedFeedback.response_data.suggestions}
                    </p>
                  </div>
                )}
                {selectedFeedback.response_data?.love_most && (
                  <div className="border rounded-lg p-3 bg-green-50/50 dark:bg-green-950/20">
                    <h4 className="font-semibold text-sm mb-2">What They Love Most</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedFeedback.response_data.love_most}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </SuperAdminLayout>
  );
}
