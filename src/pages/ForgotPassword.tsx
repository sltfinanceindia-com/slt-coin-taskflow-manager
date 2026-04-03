import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { validateEmail } from '@/utils/security';
import { ButtonSpinner } from '@/components/ui/spinner';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast({ title: 'Invalid Email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        setIsSent(true);
      }
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="p-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/auth')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center justify-center mb-4">
              <img src="/slt-hub-icon.png" alt="Tenexa" className="h-12 w-auto object-contain rounded-xl" />
            </Link>
            <h1 className="text-lg font-semibold text-primary mb-1">Forgot Password</h1>
            <p className="text-muted-foreground text-sm">We'll send you a reset link</p>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="px-6 pt-6 pb-2">
              <CardTitle className="text-xl">{isSent ? 'Check Your Email' : 'Reset Password'}</CardTitle>
              <CardDescription>
                {isSent
                  ? `We've sent a password reset link to ${email}`
                  : 'Enter your registered email address'}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {isSent ? (
                <div className="text-center space-y-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    If an account exists with that email, you'll receive a reset link shortly.
                    Check your spam folder if you don't see it.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" onClick={() => setIsSent(false)} className="w-full">
                      Try a different email
                    </Button>
                    <Button onClick={() => navigate('/auth')} className="w-full">
                      Back to Sign In
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email Address</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@company.com"
                      required
                      className="min-h-[44px]"
                      autoComplete="email"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <ButtonSpinner />
                        <span className="ml-2">Sending...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Reset Link
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
