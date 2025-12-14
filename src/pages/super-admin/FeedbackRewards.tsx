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
  TrendingUp, 
  Users, 
  Gift, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  Search,
  Filter
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

export default function FeedbackRewards() {
  const { isSuperAdmin, isLoading: roleLoading } = useIsSuperAdmin();
  const { loading: authLoading } = useAuth();
  
  const [pendingCards, setPendingCards] = useState<ScratchCard[]>([]);
  const [verifiedCards, setVerifiedCards] = useState<ScratchCard[]>([]);
  const [rejectedCards, setRejectedCards] = useState<ScratchCard[]>([]);
  const [expiredCards, setExpiredCards] = useState<ScratchCard[]>([]);
  
  const [selectedCard, setSelectedCard] = useState<ScratchCard | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
  const [scratchCardStats, setScratchCardStats] = useState<ScratchCardStats[]>([]);

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
      fetchScratchCardStats()
    ]);
  };

  const fetchPendingCards = async () => {
    const { data, error } = await supabase
      .from('scratch_cards')
      .select('*')
      .eq('verification_status', 'pending')
      .gt('card_value', 0) // Only show cards with actual prizes
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

      // Send notification email to user if verified
      if (status === 'verified') {
        await sendVerificationEmail(selectedCard!);
      }

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

  const sendVerificationEmail = async (card: ScratchCard) => {
    // TODO: Implement email sending via Supabase Edge Function
    console.log('Send email to:', card.user_email);
    // For now, just log. You can implement this with Resend or SendGrid
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

  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
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
            <div className="text-2xl font-bold">{feedbackStats?.total_responses || 0}</div>
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

      {/* Tabs for different card statuses */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
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
                  <div key={card.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-lg">{card.user_name}</p>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                            ₹{card.card_value}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          📧 {card.user_email}
                        </p>
                        {card.user_phone && (
                          <p className="text-sm text-muted-foreground mb-1">
                            📱 {card.user_phone}
                          </p>
                        )}
                        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                          <span>
                            Submitted: {new Date(card.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span>
                            Expires: {new Date(card.expiry_date).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                          <span className="capitalize">
                            Type: {card.card_type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setSelectedCard(card)}
                          variant="outline"
                          size="sm"
                        >
                          Review
                        </Button>
                      </div>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV(verifiedCards, 'verified-cards.csv')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {verifiedCards.map(card => (
                  <div key={card.id} className="border rounded-lg p-3 bg-green-50/50">
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

        {/* Rejected & Expired tabs similar structure */}
        <TabsContent value="rejected">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rejectedCards.map(card => (
                  <div key={card.id} className="border rounded-lg p-3 bg-red-50/50">
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

        <TabsContent value="expired">
          <Card>
            <CardHeader>
              <CardTitle>Expired Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {expiredCards.map(card => (
                  <div key={card.id} className="border rounded-lg p-3 bg-gray-50">
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

      {/* Review Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Review Scratch Card Claim</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
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
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Verification Notes *</label>
                <Textarea
                  placeholder="Add verification notes (e.g., 'Screenshots verified - 3 WhatsApp shares + genuine Google review confirmed')"
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  💡 Document what you verified (screenshots, reviews, etc.)
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-yellow-800 mb-2">⚠️ Before Approving:</p>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>✓ Verify screenshots show 3-5 genuine shares</li>
                  <li>✓ Check for authentic review (not copy-paste)</li>
                  <li>✓ Confirm WhatsApp submission to +91 9948397386</li>
                  <li>✓ Add detailed notes for audit trail</li>
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
    </div>
    </SuperAdminLayout>
  );
}
