import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, Profile, isDemoMode } from '../lib/supabase';

const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() || '';
const partnerUserTypes = new Set(['vendor', 'driver', 'relay_host', 'admin']);

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
        // Older profiles sometimes kept the partner role in `role` while the
        // UI only read `user_type`. Normalize both shapes so a valid partner
        // session never falls back to the customer screen.
        const storedRole = data.user_type || (data as typeof data & { role?: Profile['user_type'] }).role;
        if (storedRole && partnerUserTypes.has(storedRole)) {
          setProfile({ ...data, user_type: storedRole });
          return;
        }

        // A profile may still say "customer" even though the account is
        // already securely linked to a partner row. Resolve ownership before
        // accepting that stale role.
        const partnerLookups = await Promise.all([
          supabase.from('vendors').select('id, name, email').eq('user_id', authUser.id).limit(1).maybeSingle(),
          supabase.from('drivers').select('id').eq('user_id', authUser.id).limit(1).maybeSingle(),
          supabase.from('relay_points').select('id').eq('user_id', authUser.id).limit(1).maybeSingle(),
        ]);
        const linkedVendor = partnerLookups[0].data;
        const linkedRole: Profile['user_type'] | null = linkedVendor
          ? 'vendor'
          : partnerLookups[1].data
            ? 'driver'
            : partnerLookups[2].data
              ? 'relay_host'
              : null;

        if (linkedRole) {
          setProfile({ ...data, user_type: linkedRole });
          return;
        }

        setProfile(data);
      } else {
        if (error) {
          console.error('Error fetching profile:', error);
        }

        // A partner can already be linked to a vendor while the profile read is
        // temporarily unavailable or an older client session still has no role.
        // Resolve the ownership link before falling back to a customer profile.
        const partnerLookups = await Promise.all([
          supabase.from('vendors').select('id, name, email').eq('user_id', authUser.id).limit(1).maybeSingle(),
          supabase.from('drivers').select('id').eq('user_id', authUser.id).limit(1).maybeSingle(),
          supabase.from('relay_points').select('id').eq('user_id', authUser.id).limit(1).maybeSingle(),
        ]);

        const linkedVendor = partnerLookups[0].data;
        const linkedRole =
          linkedVendor ? 'vendor'
            : partnerLookups[1].data ? 'driver'
              : partnerLookups[2].data ? 'relay_host'
                : null;

        if (linkedRole) {
          const email = normalizeEmail(authUser.email || linkedVendor?.email);
          setProfile({
            id: authUser.id,
            full_name: linkedVendor?.name || email.split('@')[0] || 'Partenaire DeliKreol',
            phone: null,
            user_type: linkedRole,
            avatar_url: null,
            email,
            contact_email: email,
            created_at: new Date().toISOString(),
          });
          return;
        }

        partnerLookups.forEach(({ error: partnerError }) => {
          if (partnerError) console.error('Error resolving linked partner:', partnerError);
        });

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

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user).finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error restoring Supabase session:', error);
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void (async () => {
        setSession(session);
        setUser(session?.user ?? null);

        if (!session?.user) {
          setProfile(null);
          setLoading(false);
          return;
        }

        setLoading(true);
        await fetchProfile(session.user);
        setLoading(false);
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
        const cleanEmail = normalizeEmail(data.user.email || email);
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: fullName,
            phone,
            user_type: 'customer',
            email: cleanEmail,
            contact_email: cleanEmail,
          }, { onConflict: 'id' });

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

    setLoading(true);
    setProfile(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user || !data.session) {
      setLoading(false);
      return { error };
    }

    // Do not redirect until the authenticated user's partner role is loaded.
    // This prevents the protected route from rendering with a stale customer
    // profile while onAuthStateChange is still running in the background.
    setSession(data.session);
    setUser(data.user);
    await fetchProfile(data.user);
    setLoading(false);
    return { error: null };
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
