import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  prizeAmount: number;
}

export default function ShareModal({ isOpen, onClose, prizeAmount }: ShareModalProps) {
  const shareMessage = `Hey! Check out Tenexa - the best all-in-one workspace for teams! It has task management, training, attendance, rewards & more. Try it free! 🚀\n\n👉 https://tenexa.lovable.app`;

  const shareOnWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://tenexa.lovable.app')}&quote=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://tenexa.lovable.app')}`;
    window.open(url, '_blank');
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareMessage);
    toast.success('Message copied to clipboard!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">📢 Share With Your Friends</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-muted-foreground">
            Choose how you want to share Tenexa:
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={shareOnWhatsApp}
              className="bg-green-600 hover:bg-green-700"
            >
              📱 WhatsApp
            </Button>
            <Button
              onClick={shareOnFacebook}
              className="bg-blue-600 hover:bg-blue-700"
            >
              📘 Facebook
            </Button>
            <Button
              onClick={shareOnLinkedIn}
              className="bg-blue-700 hover:bg-blue-800"
            >
              🔗 LinkedIn
            </Button>
            <Button
              onClick={shareOnTwitter}
              className="bg-sky-500 hover:bg-sky-600"
            >
              🐦 Twitter
            </Button>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-sm mb-2 font-semibold">Pre-filled message:</p>
            <p className="text-sm text-gray-700 whitespace-pre-line">{shareMessage}</p>
          </div>

          <Button onClick={copyLink} variant="outline" className="w-full">
            📋 Copy Message
          </Button>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              💡 <strong>TIP:</strong> Share with at least 3-5 friends to claim your ₹{prizeAmount} reward!
            </p>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">📸 Next Steps:</h4>
            <ol className="text-sm space-y-1 text-muted-foreground">
              <li>1. Share with your friends using the buttons above</li>
              <li>2. Take screenshots of your shares</li>
              <li>3. Write a review on Google/Social media</li>
              <li>4. Send all screenshots to WhatsApp: <strong>+91 9948397386</strong></li>
            </ol>
          </div>

          <Button
            onClick={() => {
              window.open(`https://wa.me/919948397386?text=${encodeURIComponent(`Hi! I've completed sharing for my Tenexa reward (₹${prizeAmount}). Sending screenshots now.`)}`, '_blank');
            }}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Open WhatsApp to Submit Screenshots
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
