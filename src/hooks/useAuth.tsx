import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Profile {
  id: string;
  user_id?: string;
  full_name: string;
  email: string;
  role: 'super_admin' | 'org_admin' | 'admin' | 'hr_admin' | 'project_manager' | 'finance_manager' | 'manager' | 'team_lead' | 'employee' | 'intern';
  department?: string;
  employee_id?: string;
  avatar_url?: string;
  total_coins: number;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role?: Profile['role']) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isSigningOut = useRef(false); // Flag to prevent re-auth during signout

  const fetchProfile = async (userId: string) => {
    try {
      console.log('📋 Fetching profile for user ID:', userId);
      
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Error fetching profile:', profileError);
        throw profileError;
      }

      if (!profileData) {
        console.error('❌ No profile found for user:', userId);
        throw new Error('Profile not found');
      }

      // Check if account is inactive
      if (profileData.is_active === false) {
        console.warn('⚠️ User account is inactive');
        toast.error('Your account has been deactivated. Please contact an administrator.');
        await supabase.auth.signOut();
        setProfile(null);
        return;
      }

      const { data: userRoleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', profileData.id);

      const ROLE_PRIORITY: Record<string, number> = {
        'super_admin': 10, 'org_admin': 9, 'admin': 9,
        'hr_admin': 8, 'project_manager': 8, 'finance_manager': 8,
        'manager': 7, 'team_lead': 6, 'employee': 5, 'intern': 4,
      };

      let authoritativeRole: Profile['role'] = profileData.role;
      if (userRoleData && userRoleData.length > 0) {
        authoritativeRole = userRoleData.reduce((highest, current) =>
          (ROLE_PRIORITY[current.role] || 0) > (ROLE_PRIORITY[highest.role] || 0) ? current : highest
        , userRoleData[0]).role as Profile['role'];
      }

      console.log('✅ Profile loaded:', profileData.id, profileData.full_name, 'Role from user_roles:', authoritativeRole);
      setProfile({ ...profileData, role: authoritativeRole } as Profile);
      
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      console.warn('⚠️ Continuing without profile...');
    }
  };

  const refreshProfile = async () => {
    if (user) {
      console.log('🔄 Refreshing profile...');
      await fetchProfile(user.id);
    }
  };

  // ✅ NEW: Refresh session
  const refreshSession = async () => {
    try {
      console.log('🔄 Refreshing session...');
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('❌ Session refresh failed:', error);
        toast.error('Session refresh failed. Please log in again.');
        return;
      }
      
      if (data.session) {
        console.log('✅ Session refreshed successfully');
        setSession(data.session);
        setUser(data.session.user);
        
        if (data.session.user) {
          await fetchProfile(data.session.user.id);
        }
        
        toast.success('Session refreshed', { duration: 2000 });
      }
    } catch (error) {
      console.error('❌ Unexpected session refresh error:', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    let authInitialized = false;
    let lastVisibleTime = Date.now();

    // ✅ FIXED: Simplified auth initialization with proper loading management
    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing auth...');
        
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session error:', error);
          if (mounted) {
            setLoading(false);
            authInitialized = true;
          }
          return;
        }
        
        if (existingSession && mounted) {
          console.log('✅ Existing session found');
          setSession(existingSession);
          setUser(existingSession.user);
          
          // Fetch profile without blocking UI
          try {
            await fetchProfile(existingSession.user.id);
          } catch (profileError) {
            console.error('❌ Profile fetch error:', profileError);
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
      } finally {
        if (mounted) {
          console.log('✅ Auth initialization complete');
          setLoading(false);
          authInitialized = true;
        }
      }
    };

    // ✅ Handle visibility change (wake from sleep/background)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && mounted && authInitialized) {
        const now = Date.now();
        const timeSinceLastVisible = now - lastVisibleTime;
        
        // If more than 30 seconds have passed, refresh session
        if (timeSinceLastVisible > 30000) {
          console.log('🔄 App woke from sleep, refreshing session...');
          try {
            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
              console.error('❌ Session check failed:', error);
              // Session invalid, clear state
              setUser(null);
              setSession(null);
              setProfile(null);
              return;
            }
            
            if (data.session) {
              // Check if session needs refresh (expires within 5 minutes)
              const expiresAt = data.session.expires_at;
              const expiresIn = expiresAt ? (expiresAt * 1000) - Date.now() : 0;
              
              if (expiresIn < 5 * 60 * 1000) {
                console.log('🔄 Session expiring soon, refreshing...');
                const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
                
                if (refreshError) {
                  console.error('❌ Session refresh failed:', refreshError);
                } else if (refreshData.session) {
                  setSession(refreshData.session);
                  setUser(refreshData.session.user);
                  console.log('✅ Session refreshed after wake');
                }
              } else {
                // Session still valid, just update state if needed
                setSession(data.session);
                setUser(data.session.user);
                
                // Refresh profile data
                if (data.session.user) {
                  await fetchProfile(data.session.user.id);
                }
                console.log('✅ Session still valid after wake');
              }
            } else {
              // No session found, user was signed out
              console.log('👋 No session found after wake');
              setUser(null);
              setSession(null);
              setProfile(null);
            }
          } catch (error) {
            console.error('❌ Error checking session after wake:', error);
          }
        }
        
        lastVisibleTime = now;
      } else if (document.visibilityState === 'hidden') {
        lastVisibleTime = Date.now();
      }
    };

    // ✅ Handle online/offline status
    const handleOnline = async () => {
      if (mounted && authInitialized) {
        console.log('🌐 Network reconnected, checking session...');
        try {
          const { data, error } = await supabase.auth.getSession();
          if (!error && data.session) {
            setSession(data.session);
            setUser(data.session.user);
            if (data.session.user) {
              await fetchProfile(data.session.user.id);
            }
            console.log('✅ Session restored after network reconnect');
          }
        } catch (error) {
          console.error('❌ Error restoring session after network reconnect:', error);
        }
      }
    };

    // ✅ Set up auth state listener BEFORE initialization
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('🔐 Auth state changed:', event);
        
        if (!mounted) return;

        // ✅ CRITICAL: Skip all auth events if we're signing out
        if (isSigningOut.current) {
          console.log('⏭️ Skipping auth state change - signing out in progress');
          return;
        }

        // Handle sign out event
        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out via auth state change');
          setSession(null);
          setUser(null);
          setProfile(null);
          return;
        }

        // Handle token refresh events
        if (event === 'TOKEN_REFRESHED') {
          console.log('✅ Token refreshed automatically');
          setSession(newSession);
          setUser(newSession?.user ?? null);
          return;
        }

        // Only handle auth changes after initial load
        if (!authInitialized) {
          console.log('⏭️ Skipping auth state change - not initialized yet');
          return;
        }

        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          console.log('👤 User authenticated:', newSession.user.id);
          try {
            await fetchProfile(newSession.user.id);
          } catch (error) {
            console.error('❌ Profile fetch error:', error);
          }
        } else {
          console.log('👋 User signed out');
          setProfile(null);
        }
      }
    );

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    // Start initialization
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, []); // Empty dependency - one-time initialization

  // Use ref to track profile for beforeunload handler without causing re-renders
  const profileRef = useRef<Profile | null>(null);
  
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  // Separate effect for beforeunload handler
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentProfile = profileRef.current;
      if (currentProfile?.id) {
        // Use sendBeacon to reliably send data during page unload
        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/session_logs?user_id=eq.${currentProfile.id}&logout_time=is.null`;
        const body = JSON.stringify({ logout_time: new Date().toISOString() });
        navigator.sendBeacon(
          url,
          new Blob([body], { type: 'application/json' })
        );
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: 'intern'
        }
      }
    });
    
    if (error) {
      console.error('❌ Sign up error:', error);
    } else {
      console.log('✅ Sign up successful');
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔓 Signing in user:', email);
    
    // Check account lockout before attempting login
    try {
      const lockoutRes = await supabase.functions.invoke('check-login-status', {
        body: { email, action: 'check' },
      });
      
      if (lockoutRes.data?.locked) {
        const mins = lockoutRes.data.remainingMinutes || 15;
        console.warn('🔒 Account locked:', email);
        return { 
          error: new Error(`Account temporarily locked due to multiple failed login attempts. Please try again in ${mins} minute${mins !== 1 ? 's' : ''}.`) 
        };
      }
    } catch (lockoutError) {
      console.warn('⚠️ Lockout check failed, proceeding with login:', lockoutError);
    }
    
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ Sign in error:', error);
      // Record failed attempt
      try {
        await supabase.functions.invoke('check-login-status', {
          body: { email, action: 'record', success: false },
        });
      } catch (recordError) {
        console.warn('⚠️ Failed to record login attempt:', recordError);
      }
      return { error };
    }
    
    // Record successful attempt (clears failed attempts)
    try {
      await supabase.functions.invoke('check-login-status', {
        body: { email, action: 'record', success: true },
      });
    } catch (recordError) {
      console.warn('⚠️ Failed to record successful login:', recordError);
    }
    
    console.log('✅ Sign in successful');
    
    // Wait for profile to load
    if (data.user) {
      await fetchProfile(data.user.id);
      
      // Get the loaded profile with full info
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, is_active')
        .eq('user_id', data.user.id)
        .single();
      
      if (profileError) {
        console.error('❌ Failed to fetch profile:', profileError);
        return { error: profileError };
      }

      // Check if user account is active
      if (!profileData.is_active) {
        console.warn('⚠️ User account is deactivated');
        // Sign out the user immediately
        await supabase.auth.signOut();
        return { 
          error: new Error('Your account has been deactivated. Please contact your administrator to reactivate your account.') 
        };
      }
      
      if (profileData) {
        // Create session log entry for attendance tracking (only for active users)
        try {
          const { error: sessionError } = await supabase
            .from('session_logs')
            .insert({
              user_id: profileData.id,
              login_time: new Date().toISOString()
            });
          
          if (sessionError) {
            console.error('❌ Failed to create session log:', sessionError);
          } else {
            console.log('✅ Session log created for attendance tracking');
          }
        } catch (sessionError) {
          console.warn('⚠️ Failed to create session log:', sessionError);
        }
        
        // Set user as online after successful sign in
        try {
          await supabase.rpc('update_user_presence', {
            p_user_id: profileData.id,
            p_is_online: true
          });
          console.log('✅ User presence updated to online');
        } catch (presenceError) {
          console.warn('⚠️ Failed to update presence:', presenceError);
        }
      }
    }
    
    return { error };
  };

  const signOut = async () => {
    try {
      console.log('👋 Signing out...');
      
      // ✅ Set flag to prevent auth listener from re-authenticating
      isSigningOut.current = true;
      
      // Try to update session logs and presence, but don't block logout on errors
      if (profile?.id) {
        try {
          // End current session FIRST (before setting offline)
          const { data: sessions, error: fetchError } = await supabase
            .from('session_logs')
            .select('id')
            .eq('user_id', profile.id)
            .is('logout_time', null)
            .order('login_time', { ascending: false })
            .limit(1);
          
          if (fetchError) {
            console.warn('⚠️ Error fetching session for logout (expected if session expired):', fetchError.message);
          } else if (sessions && sessions.length > 0) {
            const { error: updateError } = await supabase
              .from('session_logs')
              .update({ 
                logout_time: new Date().toISOString(),
                closure_type: 'manual'
              })
              .eq('id', sessions[0].id)
              .eq('user_id', profile.id);
            
            if (updateError) {
              console.warn('⚠️ Error updating logout time (expected if session expired):', updateError.message);
            } else {
              console.log('✅ Session logout time recorded');
            }
          }
          
          // Set user as offline
          await supabase.rpc('update_user_presence', {
            p_user_id: profile.id,
            p_is_online: false
          });
          
          console.log('✅ User presence updated to offline');
        } catch (presenceError: any) {
          // Gracefully handle session/presence errors (session may already be invalid)
          console.warn('⚠️ Failed to update presence on signout (expected if session expired):', presenceError?.message);
          // Continue with logout anyway
        }
      }
      
      // Clear local state FIRST before calling signOut
      // This ensures UI updates immediately regardless of API response
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Sign out from Supabase with global scope to clear all sessions
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (signOutError: any) {
        // Handle any signOut errors gracefully - session may already be invalid
        console.log('ℹ️ SignOut completed (may have been already signed out):', signOutError?.message);
      }
      
      // ✅ Manually clear any remaining auth data from localStorage
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });
        console.log('✅ Local storage cleared');
      } catch (storageError) {
        console.warn('⚠️ Could not clear localStorage:', storageError);
      }
      
      console.log('✅ Sign out successful, state cleared');
      
      // Reset the flag after a short delay to allow any pending auth events to be ignored
      setTimeout(() => {
        isSigningOut.current = false;
      }, 1000);
      
      return { error: null };
    } catch (error: any) {
      console.error('❌ Unexpected sign out error:', error);
      // Still clear local state on unexpected errors
      setUser(null);
      setSession(null);
      setProfile(null);
      isSigningOut.current = false;
      return { error: null }; // Return null error since we successfully cleared local state
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    refreshSession, // ✅ NEW: Expose refresh function
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
