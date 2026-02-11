import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, Profile, isDemoMode } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    if (isDemoMode) {
      try {
        const raw = localStorage.getItem('delikreol_demo_profiles');
        const profiles: Profile[] = raw ? JSON.parse(raw) : [];
        const p = profiles.find((x) => x.id === userId) ?? null;
        setProfile(p);
      } catch (err) {
        console.error('Error fetching demo profile:', err);
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
      } else if (error) {
        console.error('Error fetching profile:', error);
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    if (isDemoMode) {
      // Demo mode: load session/profile from localStorage
      const sessRaw = localStorage.getItem('delikreol_demo_session');
      if (sessRaw) {
        try {
          const sess = JSON.parse(sessRaw) as { userId: string; email?: string };
          const userObj = { id: sess.userId, email: sess.email } as unknown as User;
          setUser(userObj);
          fetchProfile(sess.userId).finally(() => setLoading(false));
        } catch {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }

      // no global subscription necessary for demo
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (() => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    if (isDemoMode) {
      try {
        const raw = localStorage.getItem('delikreol_demo_profiles');
        const profiles: Profile[] = raw ? JSON.parse(raw) : [];
        const id = 'demo_' + Date.now().toString();
        const newProfile: Profile = {
          id,
          full_name: fullName,
          phone: phone || null,
          user_type: 'customer',
          avatar_url: null,
          created_at: new Date().toISOString(),
        };
        profiles.push(newProfile);
        localStorage.setItem('delikreol_demo_profiles', JSON.stringify(profiles));
        localStorage.setItem('delikreol_demo_session', JSON.stringify({ userId: id, email }));
        const userObj = { id, email } as unknown as User;
        setUser(userObj);
        setProfile(newProfile);
        return { error: null };
      } catch (err: any) {
        console.error('Demo signup error:', err);
        return { error: err };
      }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) return { error };

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: fullName,
            phone,
            user_type: 'customer',
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          return { error: profileError as any };
        }

        await fetchProfile(data.user.id);
      }

      return { error: null };
    } catch (err: any) {
      console.error('Unexpected signup error:', err);
      return { error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (isDemoMode) {
      try {
        const raw = localStorage.getItem('delikreol_demo_profiles');
        const profiles: Profile[] = raw ? JSON.parse(raw) : [];
        let p: Profile | null =
          profiles.find((x) => x.contact_email === email || (x as any).email === email) ?? null;
        // support older profile shapes where email stored on profile
        if (!p) {
          p = profiles.find((x) => (x as any).email === email) ?? null;
        }

        if (!p) {
          // create a minimal profile
          const id = 'demo_' + Date.now().toString();
          const newProfile: Profile = {
            id,
            full_name: email.split('@')[0],
            phone: null,
            user_type: 'customer',
            avatar_url: null,
            created_at: new Date().toISOString(),
          };
          profiles.push(newProfile);
          localStorage.setItem('delikreol_demo_profiles', JSON.stringify(profiles));
          p = newProfile;
        }

        localStorage.setItem('delikreol_demo_session', JSON.stringify({ userId: p.id, email }));
        const userObj = { id: p.id, email } as unknown as User;
        setUser(userObj);
        setProfile(p);
        return { error: null };
      } catch (err: any) {
        console.error('Demo sign-in error:', err);
        return { error: err };
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    if (isDemoMode) {
      localStorage.removeItem('delikreol_demo_session');
      setUser(null);
      setProfile(null);
      return;
    }

    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signUp, signIn, signOut, refreshProfile }}>
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
