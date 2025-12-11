import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Coins, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { validateEmail, rateLimiter } from '@/utils/security';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PageSpinner, ButtonSpinner } from '@/components/ui/spinner';

export default function Auth() {
  const { user, signIn, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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
    if (!rateLimiter.isAllowed(rateLimitKey, 5, 15 * 60 * 1000)) { // 5 attempts per 15 minutes
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
        
        // Security: Don't reveal specific error details to prevent user enumeration
        const genericMessage = error.message?.includes('Invalid login credentials') 
          ? "Invalid email or password. Please check your credentials and try again."
          : "Sign in failed. Please try again or contact support if the problem persists.";
        
        toast({
          title: "Sign In Failed",
          description: genericMessage,
          variant: "destructive",
        });
      } else {
        // Reset rate limit on successful login
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


  if (loading) {
    return <PageSpinner />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-3 sm:px-4 py-6 sm:py-8">
      <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <img 
              src="/lovable-uploads/56d5dd03-2808-4b88-9f9c-cc8932c46fe8.png" 
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
              Empowering productivity through smart task management and rewards
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            {validationErrors.length > 0 && (
              <Alert variant="destructive" className="mb-6">
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
              <Alert variant="destructive" className="mb-6">
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Account temporarily locked due to too many failed attempts. Please wait 15 minutes before trying again.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignIn} className="space-y-6">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}