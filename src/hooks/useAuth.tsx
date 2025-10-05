import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  id: string;
  user_id?: string; // Optional for backward compatibility
  full_name: string;
  email: string;
  role: 'admin' | 'intern';
  department?: string;
  employee_id?: string;
  avatar_url?: string;
  total_coins: number;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role?: 'admin' | 'intern') => Promise<{ error: any }>;
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

  // ✅ FIXED: Fetch profile with timeout and better error handling
  const fetchProfile = async (userId: string) => {
    try {
      console.log('📋 Fetching profile for user ID:', userId);
      
      // Set timeout for profile fetch to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      );
      
      const fetchPromise = (async () => {
        // ✅ Try fetching by id first (correct way)
        let { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        // If not found, try by user_id (fallback for old data)
        if (!data && !error) {
          console.log('Profile not found by id, trying user_id...');
          const result = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
          
          data = result.data;
          error = result.error;
        }

        if (error) {
          console.error('❌ Error fetching profile:', error);
          throw error;
        }

        if (!data) {
          console.error('❌ No profile found for user:', userId);
          throw new Error('Profile not found');
        }

        return data;
      })();
      
      // Race between fetch and timeout
      const data = await Promise.race([fetchPromise, timeoutPromise]) as Profile;
      
      console.log('✅ Profile loaded:', data.id, data.full_name);
      setProfile(data);
      
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      // Don't show toast error on profile fetch failure to avoid blocking UI
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

    // ✅ Set up auth state listener BEFORE initialization
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('🔐 Auth state changed:', event);
        
        if (!mounted) return;

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

    // Start initialization
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: 'admin' | 'intern' = 'intern') => {
    const redirectUrl = `${window.location.origin}/`;
    
    console.log('📝 Signing up user:', email);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role
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
    
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ Sign in error:', error);
      return { error };
    }
    
    console.log('✅ Sign in successful');
    
    // Wait for profile to load
    if (data.user) {
      await fetchProfile(data.user.id);
    }
    
    // Set user as online after successful sign in
    if (data.user && profile?.id) {
      try {
        await supabase.rpc('update_user_presence', {
          p_user_id: profile.id,
          p_is_online: true
        });
        console.log('✅ User presence updated to online');
      } catch (presenceError) {
        console.warn('⚠️ Failed to update presence:', presenceError);
      }
    }
    
    return { error };
  };

  const signOut = async () => {
    try {
      console.log('👋 Signing out...');
      
      // Set user as offline before signing out
      if (profile?.id) {
        try {
          await supabase.rpc('update_user_presence', {
            p_user_id: profile.id,
            p_is_online: false
          });
          
          // End current session
          const { data: sessions } = await supabase
            .from('session_logs')
            .select('id')
            .eq('user_id', profile.id)
            .is('logout_time', null)
            .limit(1);
          
          if (sessions && sessions.length > 0) {
            await supabase
              .from('session_logs')
              .update({ logout_time: new Date().toISOString() })
              .eq('id', sessions[0].id);
          }
          
          console.log('✅ User presence updated to offline');
        } catch (presenceError) {
          console.warn('⚠️ Failed to update presence on signout:', presenceError);
        }
      }
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
      } else {
        console.log('✅ Sign out successful');
      }
      
      return { error };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      return { error };
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
