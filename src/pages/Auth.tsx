import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, Lock, Eye, EyeOff, Mail, KeyRound } from 'lucide-react';
import { validateEmail, rateLimiter } from '@/utils/security';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageSpinner, ButtonSpinner } from '@/components/ui/spinner';
import { supabase } from '@/integrations/supabase/client';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function Auth() {
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
    
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
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
        // Redirect to magic link for authentication
        window.location.href = data.magicLink;
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
    <div className="min-h-screen flex items-center justify-center bg-background px-3 sm:px-4 py-6 sm:py-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <img 
              src="/slt-hub-icon.png" 
              alt="SLT work HuB"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>
          <h1 className="text-base sm:text-lg font-semibold text-primary mb-1 sm:mb-2">
            <span className="font-black">SLT</span>
            <span className="font-normal"> work </span>
            <span className="font-black">HuB</span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">Coin-Based Workfront System</p>
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
                      placeholder="your.email@sltfinanceindia.com"
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
                        placeholder="your.email@sltfinanceindia.com"
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
      </div>
    </div>
  );
}
