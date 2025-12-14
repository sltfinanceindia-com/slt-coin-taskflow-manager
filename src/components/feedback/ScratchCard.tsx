import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ScratchCard as ScratchCardType } from '@/types/feedback';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ShareModal from './ShareModal';
import confetti from 'canvas-confetti';
import { MessageCircle, Share2, CheckCircle } from 'lucide-react';

interface ScratchCardProps {
  card: ScratchCardType;
}

export default function ScratchCard({ card }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Initialize scratched state from card data
  const [isScratched, setIsScratched] = useState(card.is_scratched || false);
  const [isScratching, setIsScratching] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 250 });

  const WHATSAPP_NUMBER = '919948397386';

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi! I've completed the SLT Work Hub feedback survey.\n\n` +
      `🎫 Card Value: ₹${card.card_value}\n` +
      `📧 Email: ${card.user_email}\n` +
      `👤 Name: ${card.user_name}\n\n` +
      `I've shared with friends and attached my screenshots for verification.`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  // Initialize canvas with proper sizing
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: Math.floor(rect.width),
          height: Math.floor(rect.height)
        });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Draw scratch layer
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create gradient scratch layer
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#a0a0a0');
    gradient.addColorStop(0.5, '#c0c0c0');
    gradient.addColorStop(1, '#b0b0b0');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add scratch pattern
    ctx.fillStyle = '#999';
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Add "Scratch to reveal" text
    ctx.fillStyle = '#555';
    ctx.font = `bold ${Math.min(canvas.width / 15, 24)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✨ Scratch to reveal! ✨', canvas.width / 2, canvas.height / 2);
    
    // Add finger icon hint
    ctx.font = `${Math.min(canvas.width / 10, 40)}px Arial`;
    ctx.fillText('👆', canvas.width / 2, canvas.height / 2 + 40);
  }, [canvasSize]);

  const scratch = useCallback((x: number, y: number) => {
    if (isScratched) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear area around cursor with larger brush
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI * 2);
    ctx.fill();
  }, [isScratched]);

  const checkScratchProgress = useCallback(async () => {
    if (isScratched) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    
    // Sample every 4th pixel for performance
    for (let i = 3; i < pixels.length; i += 16) {
      if (pixels[i] === 0) transparent++;
    }

    const scratchedPercentage = (transparent / (pixels.length / 16)) * 100;

    if (scratchedPercentage > 60) {
      setIsScratched(true);
      await markAsScratched();

      // Trigger confetti if won
      if (card.card_value > 0) {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 }
        });
        toast.success(`🎉 You won ₹${card.card_value}!`);
      }
    }
  }, [isScratched, card.card_value]);

  const getPosition = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  }, []);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isScratching || isScratched) return;
    
    const pos = getPosition(e);
    if (pos) {
      scratch(pos.x, pos.y);
    }
  }, [isScratching, isScratched, getPosition, scratch]);

  const handleStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsScratching(true);
    
    const pos = getPosition(e);
    if (pos) {
      scratch(pos.x, pos.y);
    }
  }, [getPosition, scratch]);

  const handleEnd = useCallback(() => {
    setIsScratching(false);
    checkScratchProgress();
  }, [checkScratchProgress]);

  const markAsScratched = async () => {
    try {
      const { error } = await supabase.rpc('mark_card_scratched', {
        p_card_id: card.id
      });

      if (error) {
        console.error('Error marking card as scratched:', error);
      }
    } catch (error) {
      console.error('Error marking card as scratched:', error);
    }
  };

  return (
    <>
      <Card className="max-w-lg w-full shadow-2xl mx-auto">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl sm:text-3xl font-bold">
            {isScratched ? (
              card.card_value > 0 ? '🎊 Congratulations! 🎊' : '😊 Better Luck Next Time!'
            ) : (
              '🎁 Your Scratch Card!'
            )}
          </CardTitle>
          {!isScratched && (
            <p className="text-sm text-muted-foreground mt-1">
              Scratch the card below to reveal your reward
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-6 px-4 sm:px-6">
          <div 
            ref={containerRef}
            className="relative rounded-xl overflow-hidden aspect-[16/10] min-h-[200px]"
            style={{ touchAction: 'none' }}
          >
            {/* Prize layer underneath */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 flex items-center justify-center">
              <div className="text-center text-white">
                <p className="text-4xl sm:text-5xl font-bold drop-shadow-lg">
                  {card.card_value > 0 ? `₹${card.card_value}` : '🍀'}
                </p>
                <p className="text-lg sm:text-xl mt-2 font-medium">
                  {card.card_value > 0 ? 'You Won!' : 'Try Again!'}
                </p>
              </div>
            </div>

            {/* Scratch layer on top */}
            {!isScratched && (
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                className="absolute top-0 left-0 w-full h-full cursor-pointer"
                style={{ touchAction: 'none' }}
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
              />
            )}
          </div>

          {isScratched && (
            <div className="space-y-4 text-center">
              {/* Card Status Badge */}
              {card.is_scratched && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Already Revealed
                </Badge>
              )}

              {card.card_value > 0 ? (
                <>
                  <h3 className="text-lg font-semibold">💰 To Claim Your ₹{card.card_value} Reward:</h3>
                  <ol className="text-left space-y-2 max-w-md mx-auto text-sm bg-muted/50 p-4 rounded-lg">
                    <li className="flex items-start gap-2">
                      <span className="text-lg">1️⃣</span>
                      <span>Share SLT Work Hub with 2+ friends</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-lg">2️⃣</span>
                      <span>Take screenshots of your shares</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-lg">3️⃣</span>
                      <span>Send screenshots to WhatsApp below</span>
                    </li>
                  </ol>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={() => setShowShareModal(true)}
                      size="lg"
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share with Friends
                    </Button>
                    
                    <Button 
                      onClick={openWhatsApp}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send to WhatsApp
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    ⚠️ Valid for 7 days only! Verified within 48 hours.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold">🎁 Bonus Opportunity!</h3>
                  <p className="text-sm text-muted-foreground">
                    Share with 5+ friends and get a GUARANTEED ₹50 card!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={() => setShowShareModal(true)}
                      size="lg"
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Now
                    </Button>
                    
                    <Button 
                      onClick={openWhatsApp}
                      size="lg"
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-50"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact on WhatsApp
                    </Button>
                  </div>
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
    </>
  );
}
