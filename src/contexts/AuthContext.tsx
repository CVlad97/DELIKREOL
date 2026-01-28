import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useBlinkAuth } from '@blinkdotnew/react';
import { blink } from '../lib/blink';
import { Profile } from '../lib/supabase';

interface AuthContextType {
  user: any | null;
  profile: Profile | null;
  session: any | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: any | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: blinkUser, isLoading: blinkLoading, isAuthenticated } = useBlinkAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const profile = await blink.db.profiles.get(userId) as Profile | null;
      if (profile) {
        setProfile(profile);
      } else {
        // Create initial profile if it doesn't exist
        const newProfile = await blink.db.profiles.create({
          id: userId,
          user_id: userId,
          full_name: blinkUser?.displayName || 'Utilisateur',
          user_type: 'customer',
          created_at: new Date().toISOString()
        }) as Profile;
        setProfile(newProfile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const refreshProfile = async () => {
    if (blinkUser) {
      await fetchProfile(blinkUser.id);
    }
  };

  useEffect(() => {
    if (!blinkLoading) {
      if (isAuthenticated && blinkUser) {
        fetchProfile(blinkUser.id).finally(() => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    }
  }, [blinkUser, blinkLoading, isAuthenticated]);

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    try {
      const { user } = await blink.auth.signUp({
        email,
        password,
        displayName: fullName,
        metadata: { phone }
      });

      if (user) {
        await blink.db.profiles.create({
          id: user.id,
          user_id: user.id,
          full_name: fullName,
          phone,
          user_type: 'customer',
          created_at: new Date().toISOString()
        });
        await fetchProfile(user.id);
      }

      return { error: null };
    } catch (err: any) {
      console.error('Signup error:', err);
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await blink.auth.signInWithEmail(email, password);
      return { error: null };
    } catch (err: any) {
      console.error('Signin error:', err);
      return { error: err };
    }
  };

  const signOut = async () => {
    await blink.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user: blinkUser, profile, session: null, loading: blinkLoading || loading, signUp, signIn, signOut, refreshProfile }}>
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
