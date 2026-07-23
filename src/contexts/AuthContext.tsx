import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, Profile, isDemoMode } from '../lib/supabase';

const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() || '';

function buildProfileFromUser(user: User): Omit<Profile, 'created_at'> {
  const email = normalizeEmail(user.email);
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    email.split('@')[0] ||
    'Utilisateur DeliKreol';

  return {
    id: user.id,
    full_name: fullName,
    phone: null,
    user_type: 'customer',
    avatar_url: (user.user_metadata?.avatar_url as string | null | undefined) || null,
    email,
    contact_email: email,
  };
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogleCredential: (credential: string) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (authUser: User) => {
    if (isDemoMode) {
      try {
        const raw = localStorage.getItem('delikreol_demo_profiles');
        const profiles: Profile[] = raw ? JSON.parse(raw) : [];
        const p = profiles.find((x) => x.id === authUser.id) ?? null;
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
        .eq('id', authUser.id)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
      } else if (error) {
        console.error('Error fetching profile:', error);
      } else {
        const fallbackProfile = buildProfileFromUser(authUser);
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(fallbackProfile)
          .select('*')
          .maybeSingle();

        if (!createError && createdProfile) {
          setProfile(createdProfile);
        } else {
          const { data: minimalProfile, error: minimalError } = await supabase
            .from('profiles')
            .insert({
              id: fallbackProfile.id,
              full_name: fallbackProfile.full_name,
              phone: fallbackProfile.phone,
              user_type: fallbackProfile.user_type,
              avatar_url: fallbackProfile.avatar_url,
            })
            .select('*')
            .maybeSingle();

          if (!minimalError && minimalProfile) {
            setProfile(minimalProfile);
          } else {
            console.error('Error creating fallback profile:', createError || minimalError);
            setProfile({
              ...fallbackProfile,
              created_at: new Date().toISOString(),
            });
          }
        }
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
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
          fetchProfile(userObj).finally(() => setLoading(false));
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
        fetchProfile(session.user).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (() => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user);
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

        await fetchProfile(data.user);
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

  const signInWithGoogleCredential = async (credential: string) => {
    if (isDemoMode) {
      return { error: new Error('Connexion Google indisponible en mode test local.') };
    }

    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credential,
      });

      if (error) {
        return { error };
      }

      const signedInUser = data.user ?? data.session?.user ?? null;
      setSession(data.session ?? null);
      setUser(signedInUser);
      if (signedInUser) {
        await fetchProfile(signedInUser);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signUp, signIn, signInWithGoogleCredential, signOut, refreshProfile }}>
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
