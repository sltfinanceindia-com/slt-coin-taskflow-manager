import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, Lock, Eye, EyeOff, Mail, KeyRound, ArrowLeft, Heart } from 'lucide-react';
import { validateEmail, rateLimiter } from '@/utils/security';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageSpinner, ButtonSpinner } from '@/components/ui/spinner';
import { supabase } from '@/integrations/supabase/client';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Separator } from '@/components/ui/separator';

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP State
  const [otpEmail, setOtpEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState<Date | null>(null);
  
  // Redirect if already authenticated
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationErrors([]);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Client-side validation
    const errors: string[] = [];
    
    if (!validateEmail(email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    // Rate limiting check
    const rateLimitKey = `signin:${email}`;
    if (!rateLimiter.isAllowed(rateLimitKey, 5, 15 * 60 * 1000)) {
      errors.push('Too many sign-in attempts. Please try again in 15 minutes.');
      setIsRateLimited(true);
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('Sign in error:', error);
        
        const genericMessage = error.message?.includes('Invalid login credentials') 
          ? "Invalid email or password. Please check your credentials and try again."
          : "Sign in failed. Please try again or contact support if the problem persists.";
        
        toast({
          title: "Sign In Failed",
          description: genericMessage,
          variant: "destructive",
        });
      } else {
        rateLimiter.reset(rateLimitKey);
        setIsRateLimited(false);
        
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      toast({
        title: "Sign In Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        toast({
          title: "Google Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred with Google sign-in.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleSendOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValidationErrors([]);
    
    if (!validateEmail(otpEmail)) {
      setValidationErrors(['Please enter a valid email address']);
      return;
    }

    // Rate limiting
    const rateLimitKey = `otp:${otpEmail}`;
    if (!rateLimiter.isAllowed(rateLimitKey, 3, 5 * 60 * 1000)) {
      setValidationErrors(['Too many OTP requests. Please wait 5 minutes.']);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { email: otpEmail, action: 'send' }
      });

      if (error || !data?.success) {
        toast({
          title: "OTP Failed",
          description: data?.error || error?.message || "Failed to send OTP. Please try again.",
          variant: "destructive",
        });
      } else {
        setOtpSent(true);
        setOtpExpiresAt(new Date(data.expiresAt));
        toast({
          title: "OTP Sent!",
          description: "Check your email for the 6-digit code.",
        });
      }
    } catch (error: any) {
      console.error('OTP error:', error);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setValidationErrors(['Please enter the complete 6-digit OTP']);
      return;
    }

    setIsLoading(true);
    setValidationErrors([]);

    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { email: otpEmail, action: 'verify', otp }
      });

      if (error || !data?.success) {
        toast({
          title: "Verification Failed",
          description: data?.error || "Invalid OTP. Please try again.",
          variant: "destructive",
        });
      } else if (data.magicLink) {
        // Validate origin to prevent open redirect
        const linkUrl = new URL(data.magicLink);
        if (linkUrl.origin !== window.location.origin) {
          toast({ title: 'Security Error', description: 'Invalid redirect detected.', variant: 'destructive' });
        } else {
          window.location.href = data.magicLink;
        }
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const resetOTP = () => {
    setOtpSent(false);
    setOtp('');
    setOtpExpiresAt(null);
  };

  if (loading) {
    return <PageSpinner />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background" data-testid="auth-page">
      {/* Back Button */}
      <div className="p-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/')}
          className="gap-2"
          data-testid="button-back-home"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8">
        <div className="w-full max-w-md space-y-6 sm:space-y-8 min-w-0">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center justify-center mb-3 sm:mb-4">
              <img 
                src="/slt-hub-icon.png" 
                alt="Tenexa"
                className="h-10 sm:h-12 w-auto object-contain rounded-xl"
              />
            </Link>
            <h1 className="text-base sm:text-lg font-semibold text-primary mb-1 sm:mb-2">
              <span className="font-black">Tenexa</span>
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">Complete Workplace Management Platform</p>
          </div>

        <Card className="shadow-lg">
          <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Sign In to Dashboard</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            {validationErrors.length > 0 && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc pl-4 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {isRateLimited && (
              <Alert variant="destructive" className="mb-4">
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Account temporarily locked due to too many failed attempts.
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="password" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="password" className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  Password
                </TabsTrigger>
                <TabsTrigger value="otp" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  OTP
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="password">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="your.email@company.com"
                      required
                      className="min-h-[44px]"
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        className="min-h-[44px] pr-10"
                        autoComplete="current-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || isRateLimited}
                  >
                    {isLoading ? (
                      <>
                        <ButtonSpinner />
                        <span className="ml-2">Signing In...</span>
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <Button 
                    type="button"
                    variant="outline" 
                    className="w-full" 
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="otp">
                {!otpSent ? (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp-email">Registered Email</Label>
                      <Input
                        id="otp-email"
                        type="email"
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        placeholder="your.email@company.com"
                        required
                        className="min-h-[44px]"
                        autoComplete="email"
                      />
                      <p className="text-xs text-muted-foreground">
                        OTP login is only available for registered users.
                      </p>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <ButtonSpinner />
                          <span className="ml-2">Sending OTP...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Send OTP
                        </>
                      )}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Enter the 6-digit code sent to
                      </p>
                      <p className="font-medium text-foreground">{otpEmail}</p>
                      {otpExpiresAt && (
                        <p className="text-xs text-amber-600">
                          Code expires at {otpExpiresAt.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex justify-center">
                      <InputOTP
                        value={otp}
                        onChange={setOtp}
                        maxLength={6}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <Button 
                      onClick={handleVerifyOTP}
                      className="w-full" 
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        <>
                          <ButtonSpinner />
                          <span className="ml-2">Verifying...</span>
                        </>
                      ) : (
                        "Verify & Sign In"
                      )}
                    </Button>

                    <div className="flex justify-center gap-4 text-sm">
                      <Button 
                        variant="link" 
                        onClick={resetOTP}
                        className="text-muted-foreground"
                      >
                        Change email
                      </Button>
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setOtp('');
                          handleSendOTP({ preventDefault: () => {} } as any);
                        }}
                        disabled={isLoading}
                        className="text-muted-foreground"
                      >
                        Resend OTP
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center border-t">
        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
          <span>Made with</span>
          <Heart className="h-4 w-4 text-red-500 fill-red-500" />
          <span>in భారత్</span>
        </div>
      </footer>
    </div>
  );
}
