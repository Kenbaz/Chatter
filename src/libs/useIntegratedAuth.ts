"use client";

import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { useDispatch } from "react-redux";
import { auth } from "./firebase";
import { useAuth } from "./authServices";
import { setError, clearError } from "@/app/_store/errorSlice";
import { useRouter } from "next/navigation";

export function useIntegratedAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const { registerUser, signInUser, signInWithGoogle, signOutUser } = useAuth();
  const router = useRouter();

   useEffect(() => {
     const unsubscribe = auth.onAuthStateChanged((user) => {
       setUser(user);
       setInitialLoading(false);
       setLoading(false);
     });

     return () => unsubscribe();
   }, []);


 const handleSignIn = async (email: string, password: string) => {
   setLoading(true);
   try {
     const user = await signInUser(email, password);
     setUser(user);
     dispatch(clearError());
     router.push("/feeds");
     return user;
   } catch (error) {
     dispatch(setError("Failed to sign in"));
     throw error;
   } finally {
     setLoading(false);
   }
    };
    
    const handleSignUp = async (email: string, password: string) => {
        setLoading(true);
    try {
      const user = await registerUser(email, password);
      setUser(user);
      dispatch(clearError());
      router.push("/feeds");
      return user;
    } catch (error) {
      dispatch(setError("Failed to register"));
      throw error;
    } finally {
        setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
      setLoading(true);
    try {
      const user = await signInWithGoogle();
      setUser(user);
      dispatch(clearError());
      router.push("/feeds");
      return user;
    } catch (error) {
      dispatch(setError("Failed to sign in with Google"));
      throw error;
    } finally {
        setLoading(false);
    }
  };

  const handleSignOut = async () => {
      setLoading(true);
    try {
      await signOutUser();
      setUser(null);
      dispatch(clearError());
      router.push("/");
    } catch (error) {
      dispatch(setError("Failed to sign out"));
      throw error;
    } finally {
        setLoading(false);
    }
  };

  return {
    user,
    loading,
    initialLoading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signInWithGoogle: handleGoogleSignIn,
    signOut: handleSignOut,
  };
}
