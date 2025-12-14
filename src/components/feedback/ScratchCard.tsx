import React, { useRef, useState, useEffect } from 'react';
import { ScratchCard as ScratchCardType } from '@/types/feedback';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ShareModal from './ShareModal';
import confetti from 'canvas-confetti';

interface ScratchCardProps {
  card: ScratchCardType;
}

export default function ScratchCard({ card }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratched, setIsScratched] = useState(false);
  const [isScratching, setIsScratching] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw scratch-off layer
      ctx.fillStyle = '#c0c0c0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add "Scratch to reveal" text
      ctx.fillStyle = '#666';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Scratch to reveal!', canvas.width / 2, canvas.height / 2);
    }
  }, []);

  const handleScratch = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isScratched) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Clear area around cursor
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();

    // Check if enough is scratched (sample pixels)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }

    const scratchedPercentage = (transparent / (pixels.length / 4)) * 100;

    if (scratchedPercentage > 70 && !isScratched) {
      setIsScratched(true);
      await markAsScratched();

      // Trigger confetti if won
      if (card.card_value > 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const markAsScratched = async () => {
    try {
      const { error } = await supabase.rpc('mark_card_scratched', {
        p_card_id: card.id
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error marking card as scratched:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            {isScratched ? (
              card.card_value > 0 ? '🎊 Congratulations! 🎊' : '😊 Better Luck Next Time!'
            ) : (
              '🎁 You\'ve Unlocked a Scratch Card!'
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isScratched ? (
            <div className="relative">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg p-12 text-center text-white text-4xl font-bold">
                {card.card_value > 0 ? `₹${card.card_value}` : 'Try Again!'}
              </div>
              <canvas
                ref={canvasRef}
                width={500}
                height={300}
                className="absolute top-0 left-0 w-full h-full cursor-pointer rounded-lg"
                onMouseMove={(e) => isScratching && handleScratch(e)}
                onMouseDown={() => setIsScratching(true)}
                onMouseUp={() => setIsScratching(false)}
                onMouseLeave={() => setIsScratching(false)}
                onTouchMove={(e) => {
                  const touch = e.touches[0];
                  const canvas = canvasRef.current;
                  if (!canvas) return;
                  const rect = canvas.getBoundingClientRect();
                  const mouseEvent = new MouseEvent('mousemove', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                  });
                  handleScratch(mouseEvent as any);
                }}
              />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg p-12 text-center text-white">
              <p className="text-6xl font-bold mb-4">
                {card.card_value > 0 ? `₹${card.card_value}` : ''}
              </p>
              <p className="text-2xl">
                {card.card_value > 0
                  ? `You've won a ₹${card.card_value} scratch card!`
                  : "Don't worry! Share with 5+ friends for a guaranteed ₹50 card!"}
              </p>
            </div>
          )}

          {isScratched && (
            <div className="space-y-4 text-center">
              {card.card_value > 0 ? (
                <>
                  <h3 className="text-xl font-semibold">💰 To Claim Your Reward:</h3>
                  <ol className="text-left space-y-2 max-w-md mx-auto">
                    <li>1️⃣ Share SLT Work Hub with 3-5 friends</li>
                    <li>2️⃣ Take screenshots of your shares</li>
                    <li>3️⃣ Write a genuine review on Google/Social</li>
                    <li>4️⃣ Send ALL 3 screenshots to WhatsApp:</li>
                  </ol>
                  <div className="bg-green-100 border border-green-300 rounded-lg p-4 inline-block">
                    <p className="text-2xl font-bold text-green-700">
                      📱 +91 9948397386
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ⚠️ Valid for 7 days only! Verified within 48 hours.
                  </p>
                  <Button 
                    onClick={() => setShowShareModal(true)}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Share SLT Work Hub Now
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold">🎁 Bonus Opportunity!</h3>
                  <p>Share with 5+ friends and get a GUARANTEED ₹50 card!</p>
                  <Button 
                    onClick={() => setShowShareModal(true)}
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Share Now
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showShareModal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          prizeAmount={card.card_value}
        />
      )}
    </div>
  );
}
