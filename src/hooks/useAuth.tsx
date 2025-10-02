import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  id: string;
  user_id: string;
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

  const fetchProfile = async (userId: string): Promise<boolean> => {
    try {
      console.log('📋 Fetching profile for user ID:', userId);
      
      // Try fetching by id first
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // Fallback: try by user_id if not found
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

      // AUTO-CREATE: If still not found, create new profile
      if (!data && !error) {
        console.log('⚠️ Profile not found - creating new profile...');
        
        // Get user details from auth
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (!authUser) {
          console.error('❌ No authenticated user found');
          toast.error('Authentication error. Please log in again.');
          return false;
        }

        console.log('Creating profile with:', {
          id: userId,
          user_id: userId,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User'
        });

        // Create new profile
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            user_id: userId,
            full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
            email: authUser.email || '',
            role: (authUser.user_metadata?.role as 'admin' | 'intern') || 'intern',
            avatar_url: authUser.user_metadata?.avatar_url || null,
            total_coins: 0
          })
          .select()
          .maybeSingle();

        if (createError || !newProfile) {
          console.error('❌ Error creating profile:', createError);
          toast.error('Failed to create profile. Please contact support.');
          return false;
        }

        console.log('✅ Profile created successfully:', newProfile.id);
        setProfile(newProfile);
        toast.success('Welcome! Your profile has been created.');
        return true;
      }

      // Handle errors
      if (error) {
        console.error('❌ Error fetching profile:', error);
        toast.error('Failed to load profile');
        return false;
      }

      // Profile found successfully
      if (data) {
        console.log('✅ Profile loaded:', data.id, data.full_name);
        
        // Verify profile ID matches auth ID
        if (data.id !== userId && data.user_id !== userId) {
          console.error('❌ Profile ID mismatch!');
          console.error('Auth ID:', userId);
          console.error('Profile ID:', data.id);
          toast.error('Profile mismatch. Please log out and log back in.');
          return false;
        }
        
        setProfile(data);
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('❌ Error in fetchProfile:', error);
      toast.error(`Profile error: ${error.message}`);
      return false;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      console.log('🔄 Refreshing profile...');
      await fetchProfile(user.id);
    }
  };

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
    } catch (error: any) {
      console.error('❌ Unexpected session refresh error:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔐 Initializing auth...');
        
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session error:', error);
        }
        
        if (existingSession && mounted) {
          console.log('✅ Existing session found');
          setSession(existingSession);
          setUser(existingSession.user);
          
          // Check if session is old (> 1 hour)
          const tokenAge = Date.now() - new Date(existingSession.user.created_at).getTime();
          if (tokenAge > 3600000) {
            console.log('⏰ Session is old, refreshing...');
            await refreshSession();
          } else {
            await fetchProfile(existingSession.user.id);
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('🔐 Auth state changed:', event);
        
        if (!mounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          console.log('👤 User authenticated:', newSession.user.id);
          try {
            await fetchProfile(newSession.user.id);
          } catch (error) {
            console.error('❌ Failed to fetch profile in auth listener:', error);
          }
        } else {
          console.log('👋 User signed out');
          setProfile(null);
        }
        
        // Always set loading to false after auth state change
        setLoading(false);
      }
    );

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
    
    // Wait for profile to load (will auto-create if missing)
    if (data.user) {
      await fetchProfile(data.user.id);
      
      // Set user as online after profile is loaded
      if (profile?.id) {
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
    refreshSession,
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
