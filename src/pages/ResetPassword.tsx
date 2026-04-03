import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react';
import { ButtonSpinner } from '@/components/ui/spinner';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if we have a valid recovery session from the URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');

    if (type === 'recovery' && accessToken) {
      setIsValidSession(true);
    } else {
      // Also check if user already has an active session (clicked reset link)
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          setIsValidSession(true);
        }
      });
    }
    setChecking(false);
  }, []);

  const validatePassword = (pw: string): string[] => {
    const errors: string[] = [];
    if (pw.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(pw)) errors.push('At least one uppercase letter');
    if (!/[a-z]/.test(pw)) errors.push('At least one lowercase letter');
    if (!/[0-9]/.test(pw)) errors.push('At least one number');
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw)) errors.push('At least one special character');
    return errors;
  };

  const passwordErrors = password ? validatePassword(password) : [];
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordErrors.length > 0) {
      toast({ title: 'Weak Password', description: 'Please meet all password requirements.', variant: 'destructive' });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: 'Mismatch', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast({ title: 'Reset Failed', description: error.message, variant: 'destructive' });
      } else {
        setIsSuccess(true);
        toast({ title: 'Password Updated', description: 'Your password has been reset successfully.' });
        setTimeout(() => navigate('/auth'), 3000);
      }
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    }

    setIsLoading(false);
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isValidSession && !checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <ShieldCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Invalid or Expired Link</h2>
            <p className="text-sm text-muted-foreground mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Password Reset Successful</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Redirecting you to the sign-in page...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <h1 className="text-lg font-semibold text-primary mb-1">Reset Your Password</h1>
            <p className="text-muted-foreground text-sm">Enter your new password below</p>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="px-6 pt-6 pb-2">
              <CardTitle className="text-xl">New Password</CardTitle>
              <CardDescription>Choose a strong password for your account</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="min-h-[44px] pr-10"
                      autoComplete="new-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                  {password && (
                    <ul className="text-xs space-y-1 mt-2">
                      {['At least 8 characters', 'At least one uppercase letter', 'At least one lowercase letter', 'At least one number', 'At least one special character'].map((req) => (
                        <li key={req} className={passwordErrors.includes(req) ? 'text-destructive' : 'text-green-600'}>
                          {passwordErrors.includes(req) ? '✗' : '✓'} {req}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="min-h-[44px]"
                    autoComplete="new-password"
                  />
                  {confirmPassword && (
                    <p className={`text-xs ${passwordsMatch ? 'text-green-600' : 'text-destructive'}`}>
                      {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || passwordErrors.length > 0 || !passwordsMatch}
                >
                  {isLoading ? (
                    <>
                      <ButtonSpinner />
                      <span className="ml-2">Updating...</span>
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
