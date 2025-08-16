import { useState, useEffect } from "react";
import { supabase, API_BASE_URL } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  profile_image_url?: string;
  phone_number?: string;
  is_verified?: boolean;
  btcBalance?: string;
  usdtBalance?: string;
  created_at?: string;
}

interface AuthState {
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const buildProfileFromSession = (session: Session): UserProfile => {
    const u = session.user;
    const meta = (u?.user_metadata || {}) as any;
    return {
      id: u.id,
      email: u.email || "",
      first_name: meta.first_name || meta.given_name || "",
      last_name: meta.last_name || meta.family_name || "",
      username: meta.username || (u.email ? u.email.split("@")[0] : ""),
      profile_image_url: meta.avatar_url || "",
      phone_number: meta.phone || "",
      is_verified: !!u.email_confirmed_at,
      created_at: u.created_at || undefined,
    };
  };

  // Fetch user profile from our backend API
  const fetchUserProfile = async (
    session: Session
  ): Promise<UserProfile | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 404) {
        // No profile yet in DB – synthesize from session so app can proceed
        return buildProfileFromSession(session);
      }

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const userProfile = await response.json();
      return userProfile;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // As a fallback, still allow proceeding using session info
      return buildProfileFromSession(session);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
        }

        if (session) {
          const userProfile = await fetchUserProfile(session);
          setAuthState({
            user: userProfile,
            session,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error);
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        const userProfile = await fetchUserProfile(session);
        setAuthState({
          user: userProfile,
          session,
          isLoading: false,
          isAuthenticated: true,
        });
      } else if (event === "SIGNED_OUT") {
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    username?: string
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            username,
          },
        },
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error("Error signing up:", error);
      return { data: null, error: error.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error("Error signing in:", error);
      return { data: null, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error("Error signing out:", error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!authState.session) {
        throw new Error("No active session");
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authState.session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedProfile = await response.json();

      setAuthState((prev) => ({
        ...prev,
        user: updatedProfile,
      }));

      return { data: updatedProfile, error: null };
    } catch (error: any) {
      console.error("Error updating profile:", error);
      return { data: null, error: error.message };
    }
  };

  // Legacy method for backward compatibility
  const login = (userData: UserProfile) => {
    setAuthState((prev) => ({
      ...prev,
      user: userData,
      isAuthenticated: true,
      isLoading: false,
    }));
  };

  // Legacy method for backward compatibility
  const logout = () => {
    signOut();
  };

  // Legacy method for backward compatibility
  const updateUser = (updates: Partial<UserProfile>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...updates };
      setAuthState((prev) => ({
        ...prev,
        user: updatedUser,
      }));
    }
  };

  return {
    user: authState.user,
    session: authState.session,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    signUp,
    signIn,
    signOut,
    updateProfile,
    // Legacy methods for backward compatibility
    login,
    logout,
    updateUser,
  };
}
