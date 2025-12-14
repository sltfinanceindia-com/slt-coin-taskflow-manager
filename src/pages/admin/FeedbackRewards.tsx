import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScratchCard } from '@/types/feedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function FeedbackRewards() {
  const [pendingCards, setPendingCards] = useState<ScratchCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<ScratchCard | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingCards();
  }, []);

  const fetchPendingCards = async () => {
    const { data, error } = await supabase
      .from('scratch_cards')
      .select('*')
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching cards:', error);
      return;
    }

    setPendingCards(data || []);
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

      toast.success(`Card ${status === 'verified' ? 'approved' : 'rejected'} successfully`);
      
      setSelectedCard(null);
      setVerificationNotes('');
      await fetchPendingCards();
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error('Failed to verify card: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Feedback & Scratch Card Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Pending Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-yellow-600">{pendingCards.length}</p>
          </CardContent>
        </Card>
        {/* Add more stat cards */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Scratch Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingCards.map(card => (
              <div key={card.id} className="border rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{card.user_name}</p>
                  <p className="text-sm text-muted-foreground">{card.user_email}</p>
                  <p className="text-sm">Prize: ₹{card.card_value}</p>
                  <p className="text-xs text-muted-foreground">
                    Submitted: {new Date(card.created_at).toLocaleDateString()}
                  </p>
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
            ))}

            {pendingCards.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No pending verifications
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedCard && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Review Scratch Card Claim</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold">{selectedCard.user_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold">{selectedCard.user_email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-semibold">{selectedCard.user_phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prize Amount</p>
                <p className="font-semibold text-green-600">₹{selectedCard.card_value}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Verification Notes</label>
              <Textarea
                placeholder="Add verification notes (screenshots verified, review checked, etc.)"
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => verifyCard(selectedCard.id, 'verified')}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                ✅ Approve & Send Code
              </Button>
              <Button
                onClick={() => verifyCard(selectedCard.id, 'rejected')}
                disabled={loading}
                variant="destructive"
              >
                ❌ Reject
              </Button>
              <Button
                onClick={() => setSelectedCard(null)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
